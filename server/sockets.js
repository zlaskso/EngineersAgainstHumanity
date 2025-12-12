

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
    data.createGameRoom(d.gameID, d.gameSettings);
    socket.join(d.gameID);
    // console.log("gameRoomCreated -> sockets.js")
    io.to(d.gameID).emit('gameRoomCreated', {
      gameID: d.gameID,
      gameSettings: d.gameSettings
    });
  });


  socket.on('checkLobby', (d) => {
    const { gameID } = d;
    const exists = !!data.getGameRoom(gameID);

    socket.emit('checkLobbyStatus', { gameID, exists });
  });

  socket.on("getGameSettings", (gameID) => {
    const room = data.getGameRoom(gameID);
    if (!room) return;
    socket.emit("gameSettings", {
      gameSettings: room.gameSettings,
      hostSocketID: room.hostSocketID,
    });
  });

  socket.on('getParticipantsList', function (gameID) {
    const participants = data.getParticipants(gameID);
    socket.emit('updateParticipants', participants);
  });

  //test1
  socket.on('attemptJoinGame', (d) => {
    const { gameID, name, reconnectID } = d;
    console.log("attemptJoinGame received:", d);


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


  socket.on("joinLobbyScreen", (gameID) => {
    const room = data.getGameRoom(gameID);
    if (!room) return;

    // Sätt hostens socketID om ingen host är registrerad
    if (!room.hostSocketID)
      room.hostSocketID = socket.id;
    console.log(`[SERVER] Host satt:`, room.hostSocketID);


    socket.join(gameID);

    console.log(`[SERVER] ${socket.id} joined lobby ${gameID}`);
    console.log(`[SERVER] Current host: ${room.hostSocketID}`);
    console.log(`[SERVER] Participants:`, room.participants.map(p => p.name));

    socket.emit("updateParticipants", room.participants);

  });
  socket.on("getGameSettings", (gameID) => {
    const room = data.getGameRoom(gameID);
    if (!room) return;
    console.log(`[SERVER] Sending gameSettings to socketID ${socket.id}, hostSocketID: ${room.hostSocketID}`);


    socket.emit("gameSettings", {
      gameSettings: room.gameSettings,
      hostSocketID: room.hostSocketID
    });
  });

  socket.on("startGame", d => {
    const room = data.getGameRoom(d.gameID);
    io.to(d.gameID).emit("gameStarted", {
      hostSocketID: room.hostSocketID,
      participants: room.participants
    });
  });
}

export { sockets };