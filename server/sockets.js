const activeTimers = {}; // Aktiva timers per gameID {gameid: timerObject}
const timerValues = {};  // Lagrar de faktiska sekunderna som är kvar { gameID: 15 }

function sockets(io, socket, data) {

  const startServerTimer = (gameID, duration, onComplete) => {
    // Ta bort eventuell tidigare timer för detta gameID
    if (activeTimers[gameID]) clearInterval(activeTimers[gameID]);

    // Spara startvärdet
    timerValues[gameID] = duration;

    // Skicka direkt ut tiden 
    io.to(gameID).emit("timerUpdate", { timeLeft: timerValues[gameID] });

    activeTimers[gameID] = setInterval(() => {
      timerValues[gameID]--;

      // Skicka uppdatering varje sekund
      io.to(gameID).emit("timerUpdate", { timeLeft: timerValues[gameID] });

      if (timerValues[gameID] <= 0) {
        clearInterval(activeTimers[gameID]);
        delete activeTimers[gameID];
        delete timerValues[gameID]; // Rensa bort värdet när det är klart
        if (onComplete) onComplete();
      }
    }, 1000);
  };

  const startVotingPhase = (gameID) => {
    const room = data.getGameRoom(gameID);
    if (!room) return;

    const submissionsMap = data.getSubmissions(gameID);

    // FORCE SUBMIT
    room.participants.forEach(player => {
      // Om spelaren inte finns i submissionsMap har de inte skickat in något
      if (!submissionsMap[player.id]) {
        const fallbackCard = player.currentHandIndexes[0];
        console.log(`[SERVER] Auto-submitting card ${fallbackCard} for ${player.name}`);

        // NU ÄR SUBMISSIONS MAP KOMPLETT
        data.saveSubmission(gameID, player.id, fallbackCard);
      }
    });

    // BYT SKÄRM: Berätta för alla klienter att de ska pushas till /vote/gameID

    data.nowVotingPhase(gameID)
    io.to(gameID).emit("votingPhaseStarted");

    // 3. STARTA TIMER: Starta röstningstiden (t.ex. 20 sekunder)
    // När tiden går ut anropas collectVotingResults
    startServerTimer(gameID, 20, () => {
      console.log(`[SERVER] Voting time up for ${gameID}`);
      // Vi lägger en liten delay på 1.5s så att klienterna hinner "landa" på röstningssidan
      collectVotingResults(gameID)
    });
  };

  const collectVotingResults = (gameID) => {
    const room = data.getGameRoom(gameID);
    if (!room) return;

    console.log(`[SERVER] Finalizing voting for room: ${gameID}`);

    const submissionsMap = data.getSubmissions(gameID);
    const submissionsList = Object.entries(submissionsMap).map(([pid, cIdx]) => ({
      playerID: pid,
      cardIndex: cIdx
    }));

    // FORCE VOTE 
    room.participants.forEach(player => {
      const hasVoted = data.hasPlayerVoted(gameID, player.id);

      if (!hasVoted && player.isActive) {
        // filtrera bort eget kort
        const validOptions = submissionsList.filter(s => s.playerID !== player.id);

        if (validOptions.length > 0) {
          const randomChoice = validOptions[Math.floor(Math.random() * validOptions.length)];
          data.saveVote(gameID, randomChoice.cardIndex, player.id);
          console.log(`[SERVER] Auto-vote: ${player.name} voted for card index ${randomChoice.cardIndex}`);
        }
      }
    });
    
      // sammanställ resultat räkna poäng och vinnare
      const winners = data.pointToWinners(gameID);
      const winningCardIndexes = data.getWinningCardIndexes(gameID);
      const results = data.getRoundResults(gameID);
    
      // Spara allt i room.lastRoundResult så att klienterna kan hämta det
      room.lastRoundResult = {
        winnerNames: winners.map(w => w.name),
        winningCardIndexes: winningCardIndexes,
        winningCardTexts: winningCardIndexes.map(idx => data.whiteCards[idx]),
        blackCardIndex: room.currentRound.blackCardIndex,
        allSubmittedCards: results.map(r => ({
          ...r, 
          cardText: data.whiteCards[r.cardIndex]
        })),
        participants: room.participants // Skicka med spelare
      };
    

    // Klienter byter till resultView
    io.to(gameID).emit("roundFinished");

    // Vänta 10 sekunder på resultatskärmen, sen antingen ny runda eller Game Over
    startServerTimer(gameID, 10, () => {
      const roomToUpdate = data.getGameRoom(gameID);
      if (!roomToUpdate) return;

      // Kolla om vi har kört alla ronder
      if (roomToUpdate.currentRound.roundNumber >= roomToUpdate.gameSettings.numOfRounds) {
        console.log(`[SERVER] Game Over for room ${gameID}`);
        io.to(gameID).emit("gameSeshOver");
      } else {
        console.log(`[SERVER] Starting next round for room ${gameID}`);
        data.resetForNewRound(gameID);
        startSelectionPhase(gameID); // Triggar nya kort + runda
      }
    });
  };


  socket.on("requestCardsToVoteOn", (d) => {
    const room = data.getGameRoom(d.gameID);
    if (room) {
      // hämta ALLA inskickade kort
      const submissionsMap = data.getSubmissions(d.gameID);

      // omvandla mappen till en lista: [{playerID: "abc", cardIndex: 5}, ...]
      let submissionsList = Object.entries(submissionsMap).map(([pid, cIdx]) => ({
        playerID: pid,
        cardIndex: cIdx
      }));

      // filtrera bort den som frågar
      let filteredCards = submissionsList.filter((card) => card.playerID !== d.playerID);

      // blanda listan
      filteredCards = data.shuffle(filteredCards);

      // skicka tillbaka till spelaren som fråga
      socket.emit("cardsToVoteOn", { submissions: filteredCards });
    }
  });

  const broadcastHandsToAll = ( gameID ) => {
    const room = data.getGameRoom(gameID);
    if (!room) return;

    room.participants.forEach(player => {
      // check om spelaren behöver kort ex reset för ny runda
      if (!player.currentHandIndexes || player.currentHandIndexes.length === 0) {
        const nrCards = room.gameSettings.cardsOnHand;
        // ela ut korten i Data.js och spara dem på spelarobjektet
        player.currentHandIndexes = data.dealWhiteCards(gameID, player.id, nrCards);
        player.rerollsLeft = room.gameSettings.nrOfRerolls;
      }

      // io.to(player.socketID) istället för io.to(gameID) för att sicka till unik spelare
      io.to(player.socketID).emit("currentHand", {
        handIndexes: player.currentHandIndexes,
        rerollsLeft: player.rerollsLeft
      });

      console.log("[SERVER] emitting initial hand", player.currentHandIndexes, "to player", player.name)
    });
  };


  socket.on('getUILabels', function (lang) {
    socket.emit('uiLabels', data.getUILabels(lang));
  });


  socket.on('getaboutExplanations', function (lang) {
    socket.emit('aboutExplanations', data.getaboutExplanations(lang));
  });


  socket.on('getUICardLabels', function (lang) {
    socket.emit('uiCardLabels', data.getUICardLabels(lang));
  });


  socket.on('createGameRoom', function (d) {
    const gameID = data.createGameID();
    const hostID = data.createHostID();
    console.log("[SERVER] Creating game room with ID", gameID,"and settings", d.gameSettings,"and host", hostID);
    data.createGameRoom(gameID, d.gameSettings, hostID);

    socket.join(gameID);

    io.to(gameID).emit('gameRoomCreated', {
      gameID: gameID,
      hostID: hostID
    });
  });


  socket.on('checkLobby', (d) => {
    const { gameID } = d;
    const exists = !!data.getGameRoom(gameID);

    socket.emit('checkLobbyStatus', { gameID, exists });
  });

  socket.on('getParticipantsList', function (gameID) {
    const participants = data.getParticipants(gameID);
    socket.emit('updateParticipants', participants);
  });

  socket.on("join", (gameID) => {
    socket.join(gameID)
  });

  socket.on('attemptJoinGame', (d) => {
    console.log("attemptJoinGame received:", d);

    const playerID = data.createPlayerID();
    // registrera spelaren ink dess socket i data
    // socket.id behövs nog inte, verkar inte finnas någon annan logik som är beroende av den, 
    // kom ihåg att uppdatera funktionen i Data.js isf.
    data.participateInGame(d.gameID, d.nickname, socket.id, playerID);

    socket.join(d.gameID);

    socket.emit("playerJoinedGame", { playerID: playerID, nickname: d.nickname, gameID: d.gameID });

    const updatedParticipants = data.getParticipants(d.gameID);  //hämta uppdaterad deltagarlista
    console.log(`[SERVER] Broadcasting updateParticipants till rum ${d.gameID}. Antal: ${updatedParticipants.length}`);
    io.to(d.gameID).emit('updateParticipants', updatedParticipants);
  });

  socket.on("getGameSettings", ({ gameID }) => {
    const room = data.getGameRoom(gameID);
    if (!room) {
      console.log('[SERVER] Lobby not found for getGameSettings:', gameID);
      //socket.emit("lobbyNotFound");
      return;
    }

    socket.emit("gameSettings", {
      gameSettings: room.gameSettings,
      lobbyName: room.gameSettings.lobbyName,
      hostID: room.hostID,
    });
  });

  const startSelectionPhase = (gameID) => {
    const room = data.getGameRoom(gameID);
    if (!room) return;

    room.currentRound.blackCardIndex = data.dealBlackCard(gameID);

    // RUNDAN STARTAR
    io.to(gameID).emit("newRoundStarted", {
      roundCounter: room.currentRound.roundNumber,
      blackCard: room.currentRound.blackCardIndex
    });

    // DELA UT KORTEN 
    broadcastHandsToAll(gameID);

    // Starta timern för röstning
    startServerTimer(gameID, room.gameSettings.answerTime, () => {
      console.log("[DATA] Selection time up for", gameID)
      startVotingPhase(gameID);
    });
  };


  socket.on("startGame", d => {
    const room = data.getGameRoom(d.gameID);
    if (!room) {
      console.log('[SERVER] Lobby not found for startGame:', d.gameID);
      return
    };
    io.to(d.gameID).emit("gameStarted", {
      hostID: room.hostID,
      participants: room.participants
    });
    startSelectionPhase(d.gameID); // Startar första rundan
  });


  socket.on("joinLobbyPlayer", ({ gameID }) => {
    const room = data.getGameRoom(gameID);

    if (!room) {
      socket.emit("lobbyNotFound");
      return;
    }

    socket.join(gameID); //för att ta emot framtida meddelanden i detta rum
    socket.emit("updateParticipants", room.participants); //skicka aktuell deltagarlista till spelaren
  });

  socket.on('requestReroll', ({ gameID, playerID }) => {
    const room = data.getGameRoom(gameID);
    if (!room) return;

    const nrCardsOnHand = room.gameSettings.cardsOnHand;

    const player = room.participants.find(p => p.id === playerID);
    if (!player) return;

    if (player.rerollsLeft > 0) {
      const newCardIndexes = data.dealWhiteCards(
        gameID,
        playerID,
        nrCardsOnHand
      );
      player.currentHandIndexes = newCardIndexes;
      player.rerollsLeft -= 1;

      socket.emit('rerollResult', {
        newCardIndexes,
        rerollsLeft: player.rerollsLeft
      });
    } else {
      socket.emit('rerollResult', {
        newCardIndexes: [],
        rerollsLeft: 0
      });
    }
  });

  socket.on("submitCard", ({ gameID, submittingPlayerID, cardIndex }) => {
    console.log(`[SERVER] ${submittingPlayerID} Submitting card ${cardIndex}`);
    data.saveSubmission(gameID, submittingPlayerID, cardIndex);
    const submissionsMap = data.getSubmissions(gameID);
    const count = Object.keys(submissionsMap).length;
    io.to(gameID).emit("numOfSubmissions", { numOfSubmissions: count });

    // Om alla spelare har svartat, starta röstningsfasen direkt
    if (data.allPlayersSubmitted(gameID)) {
      console.log("[SERVER] All players submitted, starting voting phase");
      // starta röstningsfasen
      startVotingPhase(gameID);
    }
  });

  socket.on("submitVote", ({ gameID, voteCardIndex, votingPlayerID }) => {
    console.log(`[SERVER] Vote received for card ${voteCardIndex}`);
    data.saveVote(gameID, voteCardIndex, votingPlayerID);

    const numOfVotes = data.getNumOfVotes(gameID)

    io.to(gameID).emit("numOfVotes", { numOfVotes: numOfVotes });

    if (data.allPlayersVoted(gameID)) {

      collectVotingResults(gameID);
}});

socket.on("getCurrentGamePhase", ({ gameID }) => {
  const phase = data.getCurrentGamePhase(gameID);
  socket.emit("currentGamePhase", { gamePhase: phase });
});


socket.on("getNumOfVotes", ({ gameID }) =>{
  const numOfVotes = data.getNumOfVotes(gameID)
  socket.emit("numOfVotes", numOfVotes)

});

socket.on("getNumOfSubmissions", ({ gameID }) =>{
  const numOfSubmissions = data.getNumOfSubmissions(gameID)
  socket.emit("numOfSubmissions", numOfSubmissions)

});



  socket.on("startNextRound", ({ gameID }) => {
    const room = data.getGameRoom(gameID);
    if (!room) return;

    if (room.currentRound.roundNumber >= room.gameSettings.numOfRounds) {
      io.to(gameID).emit("gameSeshOver");
    } else {
      data.resetForNewRound(gameID);
      startSelectionPhase(gameID); // mål:använd samma kod
    }
  });

  socket.on("getRoundResult", (d) => {
    const room = data.getGameRoom(d.gameID);
    if (!room || !room.lastRoundResult) {
      console.log("[SERVER] Inget resultat hittat för rum:", d.gameID);
      return;
    }
    socket.emit("roundResult", room.lastRoundResult);
  });



  socket.on("requestCurrentHand", ({ gameID, playerID }) => {

    const room = data.getGameRoom(gameID);
    if (!room) return;

    const player = room.participants.find(p => p.id === playerID);
    if (!player) return;
    socket.emit("currentHand", {
      handIndexes: player.currentHandIndexes,
      rerollsLeft: player.rerollsLeft
    });
  });

  socket.on("getPlayerSubmissions", ({ gameID }) => {
    const room = data.getGameRoom(gameID);
    if (room) {
      const submissions = data.getSubmissions(gameID); // This is { playerID: cardIndex }
      const indexToNameMap = {};

      // Map the card index to the player's actual nickname
      Object.entries(submissions).forEach(([playerID, cardIndex]) => {
        const player = room.participants.find(p => p.id === playerID);
        if (player) {
          indexToNameMap[cardIndex] = player.name;
        }
      });
      console.log("Getting player names and submissions", indexToNameMap)
      socket.emit("returnSubmissions", indexToNameMap);
    }
  });

  socket.on("getSubmissions", (d) => {
    const room = data.getGameRoom(d.gameID);
    if (room) {
      // hämta och formattera som startVotingPhase
      const submissionsMap = data.getSubmissions(d.gameID);
      let submissionsList = Object.entries(submissionsMap).map(([pid, cIdx]) => ({
        playerID: pid,
        cardIndex: cIdx
      }));

      // blanda varje gång
      submissionsList = data.shuffle(submissionsList);

    }
  });

  socket.on("requestCurrentBlackCard", ({ gameID }) => {
    const room = data.getGameRoom(gameID);
    if (!room) return;

    // Om spelet inte har något, dela ut en ny
    if (!room.currentRound.blackCardIndex) {
      room.currentRound.blackCardIndex = data.dealBlackCard(gameID);
    }

    socket.emit("currentBlackCard", {
      blackCard: room.currentRound.blackCardIndex
    });
  });

  socket.on("getRoundCounter", ({ gameID }) => {
    const room = data.getGameRoom(gameID);
    if (!room) return;

    socket.emit("roundCounter", {
      roundCounter: room.currentRound.roundNumber
    });
  });

  socket.on("getNumOfPlayers", ({ gameID }) => {
    const room = data.getGameRoom(gameID);
    if (!room) return;

    const numOfPlayers = room.participants.length;

    socket.emit("numOfPlayers", {
      numOfPlayers: numOfPlayers
    });
  });

  socket.on("requestCurrentTime", ({ gameID }) => {
    // om det finns en aktiv timer för detta gameID, skicka dess tid
    if (timerValues[gameID] !== undefined) {
      socket.emit("timerUpdate", { timeLeft: timerValues[gameID] });
    }
  });

  socket.on("getFunnyStatistics", (gameID) => {
    console.log("[SERVER] getFunnyStatistics anropat för:", gameID);
    const room = data.getGameRoom(gameID);

    if (!room) {
      console.log("[SERVER] Rummet hittades inte!");
      return;
    }

    const funnyStats = data.getFunnyStatistics(gameID);


    socket.emit("funnyStatistics", funnyStats);
  });

  socket.on("playAgain", ({ gameID }) => {
    const room = data.getGameRoom(gameID);
    if (!room) return;

    // återställ speldata på servern (poäng, kort, rösthistorik)
    data.resetGameData(gameID);

    //  meddelande till ALLA i rummet (inklusive host)

    io.to(gameID).emit("redirectToLobby", { gameID: gameID });
  });
};

export { sockets };