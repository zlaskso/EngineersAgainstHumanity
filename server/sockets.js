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

  socket.on('participateInPoll', function(d) {
    data.participateInPoll(d.pollId, d.name);
    io.to(d.pollId).emit('participantsUpdate', data.getParticipants(d.pollId));
  });
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
}

export { sockets };