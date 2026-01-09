function sockets(io, socket, data) {


  const startVotingPhase = (gameID) => {
    const room = data.getGameRoom(gameID);
    if (!room) return;

    const submissionsMap = data.getSubmissions(gameID);
    // Gör om map till en lista: [{playerID: "x", cardIndex: 5}, ...]
    let submissionsList = Object.entries(submissionsMap).map(([pid, cIdx]) => ({
      playerID: pid,
      cardIndex: cIdx
    }));
    
    // Blanda listan för anonymitet
    submissionsList = data.shuffle(submissionsList);

    io.to(gameID).emit("goToVoteView");
    io.to(gameID).emit("votingPhaseStarted", {
      submissions: submissionsList
    });
  };


// Om timern på stora skärmen tar slut
socket.on("startVotePhase", (gameID) => {
console.log("[SERVER] All players submitted, starting voting phase");
  io.to(gameID).emit("requestFinalSelection");
});


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
    console.log("Creating game room with ID:", gameID, d.gameSettings, hostID);
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
  });


  socket.on("joinLobbyPlayer", ({ gameID }) => {
    const room = data.getGameRoom(gameID);

    if (!room) {
      socket.emit("lobbyNotFound");
      return;
    }

    socket.join(gameID); //för att ta emot framtida meddelanden i detta rum
    socket.emit("updateParticipants", room.participants); //skicka aktuell deltagarlista till spelaren
    console.log(`[SERVER] Spelare ${socket.id} joined lobby-rum ${gameID}`);
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

socket.on("submitCard", ({ gameID, playerID, cardIndex }) => {
    console.log(`[SERVER] Submitting card ${cardIndex}`);
    data.saveSubmission(gameID, playerID, cardIndex);

    // Om alla spelare har lämnat svar...
    if (data.allPlayersSubmitted(gameID)) {
      console.log("[SERVER] All players submitted, starting voting phase");
      // Anropa hjälpfunktionen vi skapade ovan
      startVotingPhase(gameID);
    }
  });

  socket.on("submitVote", ({ gameID, voteCardIndex }) => {
    console.log(`[SERVER] Vote received for card ${voteCardIndex}`);
    data.saveVote(gameID, voteCardIndex);

    if (data.allPlayersVoted(gameID)){
      const room = data.getGameRoom(gameID);

      // 1. Hämta alla vinnare och vinnande kort (som listor)
      const winners = data.pointToWinners(gameID);
      const winningCardIndexes = data.getWinningCardIndexes(gameID);

      // 2. Extrahera namnen och texterna till listor
      const winnerNames = winners.map(w => w.name);
      const winningCardTexts = winningCardIndexes.map(idx => data.whiteCards[idx]);

      const results = data.getRoundResults(gameID);
      const allSubmittedCards = results.map(r => ({
        ...r, 
        cardText: data.whiteCards[r.cardIndex]
      }));

      // 3. Spara resultatet med de nya list-fälten
      room.lastRoundResult = {
        winnerNames: winnerNames,               // NYTT: Array av namn ["Kalle", "Lisa"]
        winningCardIndexes: winningCardIndexes, // NYTT: Array av index [5, 12]
        winningCardTexts: winningCardTexts,     // NYTT: Array av texter
        
        blackCardIndex: room.currentRound.blackCardIndex,
        allSubmittedCards, 
        participants: room.participants
      };

      io.to(gameID).emit("roundFinished", room.lastRoundResult);
    }
  });

  socket.on("startNextRound", ({gameID}) => {
    const room = data.getGameRoom(gameID);
    if (!room) return;

    if (room.currentRound.roundNumber >= room.gameSettings.numOfRounds) {
      io.to(gameID).emit("gameSeshOver");
      console.log("[SERVER] Game session over, emitting gameSeshOver");
      return;
    }
    else {

    data.resetVotes(gameID);
    data.resetForNewRound(gameID);
    data.prepareNextRound(gameID);
    // Tell everyone to go back to the Black Card screen
    io.to(gameID).emit("newRoundStarted");
    }
  });

  socket.on("getRoundResult", (d) => {
    const room = data.getGameRoom(d.gameID);
    if (!room) return;
  
    socket.emit("roundResult", room.lastRoundResult);
  });

  socket.on("requestCurrentHand", ({ gameID, playerID }) => {

    const room = data.getGameRoom(gameID);
    if (!room) return;

    const player = room.participants.find(p => p.id === playerID);
    if (!player) return;


    // Om spelaren inte har någon hand, dela ut en ny
    if (!player.currentHandIndexes || player.currentHandIndexes.length === 0) {
      const nrCards = room.gameSettings.cardsOnHand;
      player.currentHandIndexes = data.dealWhiteCards(gameID, playerID, nrCards);
      player.rerollsLeft = room.gameSettings.nrOfRerolls;
      console.log("SERVER emitting initialHand", player.currentHandIndexes, "to player", playerID, "in game", gameID);
    }
     // skickar aktuell hand och antal rerolls kvar
    socket.emit("currentHand", {
      handIndexes: player.currentHandIndexes,
      rerollsLeft: player.rerollsLeft
    });
  });

  socket.on("getPlayerSubmissions", (gameID) => {
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

    console.log("[SERVER] Sending name map:", indexToNameMap);
    socket.emit("returnSubmissions", indexToNameMap);
  }
});

  socket.on("getSubmissions", (d) => {
    const room = data.getGameRoom(d.gameID);
    if (room) {
      // 1. Hämta och formatera data PRECIS som i startVotingPhase
      const submissionsMap = data.getSubmissions(d.gameID);
      let submissionsList = Object.entries(submissionsMap).map(([pid, cIdx]) => ({
        playerID: pid,
        cardIndex: cIdx
      }));
      
      // 2. Blanda (viktigt att blanda varje gång eller spara blandningen i Data.js om ordningen ska vara konstant)
      submissionsList = data.shuffle(submissionsList);

      // 3. Skicka 'votingPhaseStarted' direkt till den som frågade
      // VoteView lyssnar redan på detta event!
      socket.emit("votingPhaseStarted", { submissions: submissionsList });
    }
  });

  socket.on("requestCurrentBlackCard", ({ gameID }) => {
    const room = data.getGameRoom(gameID);
    if (!room) return;

    // Om spelaren inte har någon hand, dela ut en ny
    if (!room.currentRound.blackCardIndex) {
      room.currentRound.blackCardIndex = data.dealBlackCard(gameID);
    }
    
    socket.emit("currentBlackCard", {
      blackCard: room.currentRound.blackCardIndex
    });
    });

};

export { sockets };