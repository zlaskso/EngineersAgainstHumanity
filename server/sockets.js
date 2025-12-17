

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

  socket.on('requestInitialHand', ({ gameID, playerID }) => {
    const room = data.getGameRoom(gameID);
    if (!room) return;

    const player = room.participants.find(p => p.id === playerID);
    if (!player) return;
    // Om spelaren redan har en hand, skicka tillbaka den
    if (player.currentHandIndexes && player.currentHandIndexes.length > 0) {
    socket.emit("initialHand", {
      handIndexes: player.currentHandIndexes,
      rerollsLeft: player.rerollsLeft
    });
    return;
  }

    // Server drar N nya kort
    const nrCardsOnHand = room.gameSettings.cardsOnHand;

    console.log(`Dealing initial hand of ${nrCardsOnHand} cards to player ${playerID} in game ${gameID}`);

    const newCards = data.dealWhiteCards(gameID, playerID, nrCardsOnHand);
    console.log(`Dealt cards indexes:`, newCards);
    player.currentHandIndexes = newCards;


    // skicka tillbaka den kompletta handen till *denna* klient
    socket.emit('initialHand', {
      handIndexes: newCards,
      //rerollsLeft: room.gameSettings.nrOfRerolls
    });
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

    



}




export { sockets };