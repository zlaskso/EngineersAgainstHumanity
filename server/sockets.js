

function sockets(io, socket, data) {

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
    console.log("Creating game room with ID:", d.gameID, d.gameSettings, d.hostID);
    data.createGameRoom(d.gameID, d.gameSettings, d.hostID);

    socket.join(d.gameID);

    io.to(d.gameID).emit('gameRoomCreated', {
      gameID: d.gameID,
      gameSettings: d.gameSettings,
      hostID: d.hostID
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

  socket.on('attemptJoinGame', (d) => {
    const { gameID, name, playerID } = d;
    console.log("attemptJoinGame received:", d);
    const room = data.getGameRoom(gameID);
    if (!room) {
      socket.emit("attemptJoinGameFailed - lobby not found");
      return;
    }

    // registrera spelaren ink dess socket i data
    const player = data.participateInGame(
      gameID,
      name,
      socket.id, // SOCKET
      playerID
    );

    if (!player) {
      socket.emit("attemptJoinGameFailed - no player to register");
      return;
    }

    socket.join(gameID);
    socket.emit("playerRegistered", { id: player.id });
    
    const updatedParticipants = data.getParticipants(gameID);  //hämta uppdaterad deltagarlista
    console.log(`[SERVER] Broadcasting updateParticipants till rum ${gameID}. Antal: ${updatedParticipants.length}`);
    io.to(gameID).emit('updateParticipants', updatedParticipants);
  });


  socket.on("joinLobbyHost", ({ gameID, hostID }) => {
  const room = data.getGameRoom(gameID);
  if (!room) {
    socket.emit("joinLobbyHostFailed - lobby not found");
    return;
  }

  if (hostID && !room.hostID) {
    room.hostID = hostID;
    console.log(`[SERVER] HostID satt: ${hostID}`);
  }

  socket.join(gameID);
  console.log(`[SERVER] ${socket.id} joined lobby ${gameID}`);
  console.log(`[SERVER] Participants:`, room.participants.map(p => p.name));
  socket.emit("updateParticipants", room.participants);
});


  socket.on("getGameSettings", ({ gameID }) => {
  const room = data.getGameRoom(gameID);
  if (!room) {
    console.log('[SERVER] Lobby not found for getGameSettings:', gameID);
    socket.emit("lobbyNotFound");
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


}

export { sockets };