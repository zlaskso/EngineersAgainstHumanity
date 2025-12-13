

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
    console.log("Creating game room with ID:", d.gameID, d.gameSettings);
    data.createGameRoom(d.gameID, d.gameSettings, d.hostID);
    console.log("Game room created:", d.gameID, 'med regler:', d.gameSettings);

    socket.join(d.gameID);
    // console.log("gameRoomCreated -> sockets.js")

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

  //test1
  socket.on('attemptJoinGame', (d) => {
    const { gameID, name, playerID } = d;
    console.log("attemptJoinGame received:", d);
    const room = data.getGameRoom(gameID);
    if (!room) {
      socket.emit("lobbyNotFound");
      return;
    }

    // registrera spelaren i datalagret
    // ink socket
    const player = data.participateInGame(
      gameID,
      name,
      socket.id, // SOCKET
      playerID
    );

    if (!player) {
      // om player är null = något gick fel
      socket.emit("no player to register  found");
      return;
    }

    // anslutade spelaren till rätt "room" i socket.io
    socket.join(gameID);

    // spara players ID i klientens localStorage
    socket.emit("playerRegistered", { id: player.id });

    // hämta uppdtaterad deltagarlista
    const updatedParticipants = data.getParticipants(gameID);

    // uppdatera listan till ALLA i rummet (inklusive den nya/återanslutande spelaren) VERKAR EJ FUNGERA
    //socket.emit('updateParticipants', updatedParticipants); // Synkroniserar listan
    console.log(`[SERVER] Broadcasting updateParticipants till rum ${gameID}. Antal: ${updatedParticipants.length}`);
    io.to(gameID).emit('updateParticipants', updatedParticipants);
  });

  //joinLobby för host

  socket.on("joinLobby", ({ gameID, hostID }) => {
  const room = data.getGameRoom(gameID);
  if (!room) {
    socket.emit("lobbyNotFound");
    return;
  }

  // sätt hostID första gången
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
    //participants: room.participants
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
  
  // 1. Kritiskt: Anslut denna socket till rummet så den kan ta emot broadcasts
  socket.join(gameID); 
  
  // 2. Skicka den aktuella deltagarlistan till ENDAST denna klient
  socket.emit("updateParticipants", room.participants); 
  
  console.log(`[SERVER] Spelare ${socket.id} joined lobby-rum ${gameID}`);
});
}

export { sockets };