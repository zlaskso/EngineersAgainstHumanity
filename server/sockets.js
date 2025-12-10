function sockets(io, socket, data) {
  
  socket.on('getUILabels', function(lang) {
    socket.emit('uiLabels', data.getUILabels(lang));
  });

  socket.on('getaboutExplanations', function(lang) {
    socket.emit('aboutExplanations', data.getaboutExplanations(lang));
  });

  socket.on('getUICardLabels', function(lang) {
    socket.emit('uiCardLabels', data.getUICardLabels(lang));
  });

  socket.on('createPoll', function(d) {
    data.createPoll(d.pollId, d.lang)
    socket.emit('pollData', data.getPoll(d.pollId));
  });

  socket.on('addQuestion', function(d) {
    data.addQuestion(d.pollId, {q: d.q, a: d.a});
    socket.emit('questionUpdate', data.activateQuestion(d.pollId));
  });

  socket.on('joinPoll', function(pollId) {
    socket.join(pollId);
    socket.emit('questionUpdate', data.activateQuestion(pollId))
    socket.emit('submittedAnswersUpdate', data.getSubmittedAnswers(pollId));
  });
/*
  socket.on('participateInGame', function(d) {
    data.participateInPoll(d.pollId, d.name);
    io.to(d.pollId).emit('updateParticipants', data.getParticipants(d.pollId));
  });
  */
  socket.on('startPoll', function(pollId) {
    io.to(pollId).emit('startPoll');
  })
  socket.on('runQuestion', function(d) {
    let question = data.activateQuestion(d.pollId, d.questionNumber);
    io.to(d.pollId).emit('questionUpdate', question);
    io.to(d.pollId).emit('submittedAnswersUpdate', data.getSubmittedAnswers(d.pollId));
  });

  socket.on('submitAnswer', function(d) {
    data.submitAnswer(d.pollId, d.answer);
    io.to(d.pollId).emit('submittedAnswersUpdate', data.getSubmittedAnswers(d.pollId));
  }); 

  socket.on('createGameRoom',function(d) {
    data.createGameRoom(d.gameID, d.gameSettings);
    socket.join(d.gameID);
    // console.log("gameRoomCreated -> sockets.js")
    io.to(d.gameID).emit('gameRoomCreated', {
      gameID: d.gameID,
      gameSettings: d.gameSettings
      });
  });
  socket.on("getGameSettings", (gameID) => {
  const room = data.getGameRoom(gameID);  
  socket.emit("gameSettings", room);      
  });

socket.on('checkLobby', (d) => {
    const { gameID } = d;
    const exists = !!data.getGameRoom(gameID); 
    
    socket.emit('checkLobbyStatus', { gameID, exists });
});

socket.on("getGameSettings", (gameID) => {
    const room = data.getGameRoom(gameID);
    
    if (room) {
        socket.emit("gameSettings", room);
    } else {
        socket.emit("lobbyNotFound"); 
    }
});

socket.on('getParticipantsList', function(gameID) {
    const participants = data.getParticipants(gameID);
    socket.emit('updateParticipants', participants);
});

//test1
socket.on('attemptJoinGame', (d) => {
    const { gameID, name, reconnectID } = d;

    const room = data.getGameRoom(gameID);
    if (!room) {
        socket.emit("lobbyNotFound");
        return;
    }

    // 1. Registrera eller reconnecta spelaren.
    // OBS: Skickar med socket.id här!
    const player = data.participateInGame(
        gameID,
        name,
        socket.id, // SOCKET
        reconnectID
    );
    
    if (!player) {
      // Borde inte hända om getGameRoom lyckas, men bra säkerhetsåtgärd.
      socket.emit("lobbyNotFound");
      return;
    }

    // 2. Låt den anslutande socketen gå med i Socket.IO-rummet
    socket.join(gameID);

    // 3. Spara permanent ID till klienten (viktigt för reconnect)
    socket.emit("playerRegistered", { id: player.id });

    // 4. Hämta den kompletta uppdaterade listan
    const updatedParticipants = data.getParticipants(gameID);

    // 5. Uppdatera listan till ALLA i rummet (inklusive den nya/återanslutande spelaren)
    io.to(gameID).emit('updateParticipants', updatedParticipants);
});

// sockets.js, in attemptJoinGame-hanteraren:

/*
socket.on('attemptJoinGame', (d) => {
    const { gameID, name } = d;
    
    // 1. Validera om lobbyn existerar
    if (!data.getGameRoom(gameID)) {
        console.log(`Lobby ${gameID} Not Found for player ${name}`);
        socket.emit("lobbyNotFound"); 
        return; 
    }
    
    // 2. Registrera spelaren i Data.js (Måste vara en funktion som lägger till permanent!)
    // Om data.participateInPoll inte sparar spelare permanent i GameRoom-objektet, 
    // MÅSTE du justera den metoden i din Data.js-fil.
    data.participateInPoll(gameID, name);
    
    // 3. Låt den anslutande socketen gå med i Socket.IO-rummet
    socket.join(gameID);
    
    console.log(`Spelare ${name} gick med i lobby ${gameID}`);
    
    // 4. Hämta den kompletta uppdaterade listan
    const updatedParticipants = data.getParticipants(gameID);
    
    // 5. Skicka listan till ALLA i rummet (inklusive den nya spelaren)
    // Detta uppdaterar alla host-flikar/väntande flikar
    console.log(updatedParticipants)
    io.to(gameID).emit('updateParticipants', updatedParticipants); 
});
*/

socket.on('joinLobbyScreen', function(gameID) {
    // Låt Socket.IO-anslutningen (LobbyView) gå med i rummet
    socket.join(gameID);
    
    // Skärmen måste omedelbart hämta den aktuella listan (synkronisering)
    const participants = data.getParticipants(gameID);
    socket.emit('updateParticipants', participants);
    console.log(`Lobby Screen anslöt till rum ${gameID}`);
});
}

export { sockets };