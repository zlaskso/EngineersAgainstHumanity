'use strict';
import { readFileSync } from "fs";

// Store data in an object to keep the global namespace clean. In an actual implementation this would be interfacing a database...
function Data() {
  this.gameRooms = {};
  this.whiteCards = this.getUICardLabels().whiteCards;
  this.blackCards = this.getUICardLabels().blackCards;
}

/***********************************************
For performance reasons, methods are added to the
prototype of the Data object/class
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
***********************************************/


Data.prototype.getUILabels = function (lang) {
  //check if lang is valid before trying to load the dictionary file
  if (!["en", "sv"].some(el => el === lang))
    lang = "en";
  const labels = readFileSync("./server/data/labels-" + lang + ".json");
  return JSON.parse(labels);
}

Data.prototype.getUICardLabels = function (lang) {
  //check if lang is valid before trying to load the dictionary file
  if (!["en", "sv"].some(el => el === lang))
    lang = "en";
  const cardLabels = readFileSync("./server/cards-" + lang + ".json");
  return JSON.parse(cardLabels);
}

Data.prototype.getaboutExplanations = function (lang) {
  //check if lang is valid before trying to load the dictionary file
  if (!["en", "sv"].some(el => el === lang))
    lang = "en";
  const labels = readFileSync("./server/data/about-" + lang + ".json");
  return JSON.parse(labels);
}


Data.prototype.roomExists = function (gameID) {
  return typeof this.gameRooms[gameID] !== "undefined"
}


Data.prototype.participateInGame = function (
  gameID,
  name,
  socketID,
  playerID // identifier från klienten
) {
  const room = this.getGameRoom(gameID);
  if (!room) return null;

  // kolla om spelaren redan finns (återansluter)
  const existingPlayer = room.participants.find(
    (p) => p.id === playerID
  );

  if (existingPlayer) {
    console.log("RECONNECTING PLAYER:", existingPlayer.name);

    existingPlayer.socketID = socketID;
    existingPlayer.isActive = true;
    existingPlayer.name = name; // om spelaren bytt namn

    return existingPlayer; // skapar ingen ny spelare
  }

  // skapa ny spelare
  const newPlayer = {
    id: playerID,       // använd det ID som klienten skickade med
    socketID: socketID, // socket.id
    name: name,
    isHost: false,
    isActive: true,
    rerollsLeft: room.gameSettings.nrOfRerolls,
    currentHandIndexes: [],
    points: 0,
    laidVotes: [],
    hasSubmittedIndex: null
  };

  room.participants.push(newPlayer);

  console.log("[DATA] ADDING PLAYER:", newPlayer);
  //console.log("ROOM NOW:", room.participants); //participants är en array av alla spelare i rummet

  return newPlayer;
};

Data.prototype.getParticipants = function (gameID) {
  if (this.roomExists(gameID)) {
    //console.log("getParticipants -> Data.js", this.gameRooms[gameID].participants);
    return this.gameRooms[gameID].participants;
  }
  return [];
};

Data.prototype.createGameRoom = function (gameId, gameSettings, hostID, participants) {
  if (gameId && gameSettings) {
    const allWhiteCardIndexes = [...Array(this.whiteCards.length).keys()];
    const allBlackCardIndexes = [...Array(this.blackCards.length).keys()];
    this.gameRooms[gameId] = {
      gameSettings,
      hostID: hostID,
      participants: participants || [], //Om participants finns och inte är null/undefined → använd det.|| betyder “eller”.
      whiteCardDeck: this.shuffle(allWhiteCardIndexes),
      usedWhiteCards: [],
      blackCardDeck: this.shuffle(allBlackCardIndexes),
      usedBlackCards: [],
      currentRound: {
        roundNumber: 1,
        submissions: {},   
        votes: {}, 
        voteCount: 0,   
        blackCardIndex: null,
        gamePhase: "SELECTION"
      }
    }
  } else {
    console.log("[DATA] createGameRoom: Missing gameId or gameSettings");
  }
  console.log("[DATA] gameRoom now", this.gameRooms[gameId]);
};

Data.prototype.getGameRoom = function (gameID) {
  return this.gameRooms[gameID] || null;
};

Data.prototype.shuffle = function (array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
};

Data.prototype.dealWhiteCards = function (gameID, playerID, nrCardsOnHand) {
  const room = this.getGameRoom(gameID);
  if (!room) return null;

  const player = room.participants.find(p => p.id === playerID);
  if (!player) return null;

  /* if (!player.hand) {
    player.hand = [];
  } */

  const cardsToDealIndexes = [];
  for (let i = 0; i < nrCardsOnHand; i++) {
    if (room.whiteCardDeck.length === 0) {
      // Om leken är tom, blanda om använda kort
      room.whiteCardDeck = this.shuffle(room.usedWhiteCards);
      room.usedWhiteCards = [];
    }
    const cardIndex = room.whiteCardDeck.pop();
    room.usedWhiteCards.push(cardIndex);
    const cardText = this.whiteCards[cardIndex];
    //player.hand.push(cardIndex);
    cardsToDealIndexes.push(cardIndex);
  }
  return cardsToDealIndexes;
};

Data.prototype.dealBlackCard = function (gameID) {
  const room = this.getGameRoom(gameID);
  if (!room) return null;

  if (room.blackCardDeck.length === 0) {
    // Om leken är tom, blanda om använda kort
    room.blackCardDeck = this.shuffle(room.usedBlackCards);
    room.usedBlackCards = [];
  }
  const cardIndex = room.blackCardDeck.pop();
  room.usedBlackCards.push(cardIndex);
  return cardIndex;
};

Data.prototype.createGameID = function () {
  // Borde kolla ifall ett sånt GameID redan finns för att undvika krockar
  return Math.floor(Math.random() * 100000);
};

Data.prototype.createHostID = function () {
  // Eftersom det bara finns en host per lobby, finns ingen risk för krockar
  return 'host-' + Math.random().toString(36).substring(2, 10);
};

Data.prototype.createPlayerID = function () {
  // Borde kolla ifall ett sånt PlayerID redan finns för att undvika krockar
  // Då behöver vi veta PlayerID för alla spelare i lobbyn som spelaren ska gå med i.
  return 'player-' + Math.random().toString(36).substring(2, 10);
};

Data.prototype.saveSubmission = function (gameID, submittingPlayerID, cardIndex) {
  const room = this.getGameRoom(gameID);
  if (room) {
    room.currentRound.submissions[submittingPlayerID] = cardIndex;
  }
};

Data.prototype.saveVote = function (gameID, cardIndex, votingPlayerID) {
  const room = this.getGameRoom(gameID);

  const submissions = room.currentRound.submissions;
  const playerWhoSubmittedCard = Object.keys(submissions).find(
    (playerId) => submissions[playerId] === cardIndex
  );

  const voter = room.participants.find(p => p.id === votingPlayerID);

  if (voter && playerWhoSubmittedCard) {
    // lägg till id i den som röstades lista
    voter.laidVotes.push(playerWhoSubmittedCard);
    
    // logga på den spelarens laid votes
    console.log(`[DATA] Spelare ${voter.name} röstade på ${playerWhoSubmittedCard}`);
    console.log(`[DATA] ${voter.name} har nu röstat på:`, voter.laidVotes);

  }

  if (!room.currentRound.votes[cardIndex]) {
    room.currentRound.votes[cardIndex] = 0;
    }
  room.currentRound.votes[cardIndex] += 1;
  room.currentRound.voteCount += 1;
  console.log("[DATA] voteCount:", room.currentRound.voteCount, "participants:", room.participants.length);

};

Data.prototype.getNumOfVotes = function (gameID){
    const room = this.getGameRoom(gameID);
    if (!room) return 0;
    return room.currentRound.voteCount;
}

Data.prototype.getNumOfSubmissions = function (gameID) {
  const room = this.getGameRoom(gameID);
  if (!room) return 0;
  const numOfSubmissions = Object.keys(room.currentRound.submissions).length;
  return numOfSubmissions;
};

Data.prototype.getCurrentGamePhase = function (gameID) {
  const room = this.getGameRoom(gameID);
    if (!room) return ;
  //const currentGamePhase = room.currentRound.gamePhase;
  console.log("[DATA] gamePhase är nu", room.currentRound.gamePhase)
  return room.currentRound.gamePhase;
};

Data.prototype.nowVotingPhase = function (gameID) {
  const room = this.getGameRoom(gameID);
  if (!room) return;
  room.currentRound.gamePhase = "VOTING";
  console.log("[DATA] gamePhase har ändrats till", room.currentRound.gamePhase)
};


Data.prototype.allPlayersVoted = function (gameID) {
  const room = this.getGameRoom(gameID);
  if (!room) return false;
  
  // Kollar om antalet lagda röster är lika med antalet deltagare
  const activeVoters = room.participants.filter(p => p.isActive);
  return room.currentRound.voteCount >= activeVoters.length;};

Data.prototype.getRoundResults = function (gameID) {
  const room = this.getGameRoom(gameID);
  if (!room) return [];

  // Omvandla submissions-objekt till en lista för frontend att läsa
  const results = Object.entries(room.currentRound.submissions).map(([playerID, cardIndex]) => {
    const player = room.participants.find(p => p.id === playerID);
    return {
      playerID: playerID,
      name: player ? player.name : "Okänd",
      cardIndex: cardIndex,
      votes: room.currentRound.votes[cardIndex] || 0
    };
  });

  return results;
};

Data.prototype.pointToWinners = function (gameID) {
  const room = this.getGameRoom(gameID);
  if (!room) return [];

  let maxVotes = 0;

  // 1. Ta reda på vad högsta antalet röster är i denna runda
  for (const cardIndex of Object.values(room.currentRound.submissions)) {
    const votes = room.currentRound.votes[cardIndex] || 0;
    if (votes > maxVotes) {
      maxVotes = votes;
    }
  }

  // Om ingen röst lagd (maxVotes = 0), ingen vinner
  if (maxVotes === 0) return [];

  const winners = [];

  for (const [playerID, cardIndex] of Object.entries(room.currentRound.submissions)) {
    const votes = room.currentRound.votes[cardIndex] || 0;

    if (votes === maxVotes) {
      const player = room.participants.find(p => p.id === playerID);
      if (player) {
        player.points += 1;
        winners.push(player);
      }
    }
  }

  return winners; // Returnerar en array av vinnare
};

Data.prototype.getWinningCardIndexes = function (gameID) {
  const room = this.getGameRoom(gameID);
  if (!room) return [];

  let maxVotes = 0;

  // 1. Hitta max röster
  for (const cardIndex of Object.values(room.currentRound.submissions)) {
    const votes = room.currentRound.votes[cardIndex] || 0;
    if (votes > maxVotes) {
      maxVotes = votes;
    }
  }

  if (maxVotes === 0) return [];

  const winningCardIndexes = [];

  for (const cardIndex of Object.values(room.currentRound.submissions)) {
    const votes = room.currentRound.votes[cardIndex] || 0;
    if (votes === maxVotes) {
      if (!winningCardIndexes.includes(cardIndex)) {
        winningCardIndexes.push(cardIndex);
      }
    }
  }

  return winningCardIndexes; // Returnerar en array av kort-index
};


Data.prototype.getSubmissions = function (gameID) {
  const room = this.getGameRoom(gameID);
  return room ? room.currentRound.submissions : {};
};

Data.prototype.allPlayersSubmitted = function (gameID) {
  const room = this.getGameRoom(gameID);
  if (!room) return false;
  const totalParticipants = room.participants.length;
  const totalSubmissions = Object.keys(room.currentRound.submissions).length;
  return totalSubmissions >= totalParticipants;
};

Data.prototype.resetForNewRound = function (gameID) {
  const room = this.getGameRoom(gameID);
  if (!room) return;

  room.currentRound.roundNumber++;
  console.log(`[DATA] Room ${gameID} moved to round ${room.currentRound.roundNumber}`);
  //console.log(`[DATA] Resetting data for new round in room ${room}`);


  // resetta inlämnade kort
  room.currentRound.submissions = {};

  // resetta röster
  room.currentRound.blackCardIndex = null;
  room.currentRound.votes = {};
  room.currentRound.voteCount = 0;
  room.currentRound.gamePhase = "SELECTION"

  // ny hand för alla (så requestCurrentHand delar ut nytt)
  for (const p of room.participants) {
    p.currentHandIndexes = [];
    p.rerollsLeft = room.gameSettings.nrOfRerolls;
  }
};

Data.prototype.getMostCompatiblePairs = function (gameID) {
  const room = this.getGameRoom(gameID);
  if (!room) return [];

  const pairs = [];
  const participants = room.participants;

  for (let i = 0; i < participants.length; i++) {
    for (let j = i + 1; j < participants.length; j++) {
      const p1 = participants[i];
      const p2 = participants[j];

      // hur många gånger p1 röstade på p2
      const p1VotesOnP2 = p1.laidVotes.filter(id => id === p2.id).length;
      // hur många gånger p2 röstade på p1
      const p2VotesOnP1 = p2.laidVotes.filter(id => id === p1.id).length;

      pairs.push({
        names: [p1.name, p2.name],
        score: p1VotesOnP2 + p2VotesOnP1,
        details: `${p1.name} röstade ${p1VotesOnP2} ggr på ${p2.name}, och vice versa ${p2VotesOnP1} ggr.`
      });
    }
  }

  // Sortera så de med högst sammanlagd score kommer först
  return pairs.sort((a, b) => b.score - a.score);
};

Data.prototype.getSecretAdmirers = function (gameID) {
  const room = this.getGameRoom(gameID);
  if (!room) return [];

  const admirers = [];

  room.participants.forEach(voter => {
    // Räkna röster per person för denna väljare
    const voteCounts = {};
    voter.laidVotes.forEach(targetId => {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    });

    for (const [targetId, count] of Object.entries(voteCounts)) {
      const target = room.participants.find(p => p.id === targetId);
      if (!target) continue;

      // Kolla hur många gånger target röstade tillbaka på voter
      const returnVotes = target.laidVotes.filter(id => id === voter.id).length;

      admirers.push({
        admirer: voter.name,
        target: target.name,
        votesGiven: count,
        votesReceived: returnVotes,
        intensity: count - returnVotes // Högt värde = väldigt ensidigt
      });
    }
  });

  return admirers.sort((a, b) => b.intensity - a.intensity);
};

Data.prototype.getLeastCompatiblePairs = function (gameID) {
  const room = this.getGameRoom(gameID);
  if (!room) return [];

  const results = [];
  const participants = room.participants;

  for (let i = 0; i < participants.length; i++) {
    for (let j = i + 1; j < participants.length; j++) {
      const p1 = participants[i];
      const p2 = participants[j];

      const totalMutualVotes = 
        p1.laidVotes.filter(id => id === p2.id).length + 
        p2.laidVotes.filter(id => id === p1.id).length;

      results.push({
        names: [p1.name, p2.name],
        score: totalMutualVotes
      });
    }
  }

  // Sortera med lägst score först
  return results.sort((a, b) => a.score - b.score);
};

Data.prototype.getFunnyStatistics = function (gameID) {
  const room = this.getGameRoom(gameID);
  if (!room) return {};
  console.log("[DATA} BERÄKNAR FUNNY STATISTiC FÖR:", gameID);

  const allCompatible = this.getMostCompatiblePairs(gameID);
  const allLeastCompatible = this.getLeastCompatiblePairs(gameID);
  const allAdmirers = this.getSecretAdmirers(gameID);

  // Hjälpfunktion för att hämta alla med högsta poäng
  const getTopScorers = (list, key) => {
    if (list.length === 0) return [];
    const topScore = list[0][key];
    return list.filter(item => item[key] === topScore);
  };

  // Hämta ut topplistorna
  let mostCompatible = getTopScorers(allCompatible, 'score');
  let leastCompatible = getTopScorers(allLeastCompatible, 'score');
  let secretAdmirers = getTopScorers(allAdmirers, 'intensity');

  //  Om högsta poängen är 0 betyder det att ingen röstat på någon
  if (mostCompatible.length > 0 && mostCompatible[0].score === 0) {
    mostCompatible = [];
  }

  //  Om ingen gett en röst alls (votesGiven är 0)
  if (secretAdmirers.length > 0 && secretAdmirers[0].votesGiven === 0) {
    secretAdmirers = [];
  }
  
//filtrera främlingar
  if (leastCompatible.length > 0 && room.currentRound.roundNumber <= 1) {
    leastCompatible = [];
  }

  return {
    mostCompatiblePairs: mostCompatible,
    leastCompatiblePairs: leastCompatible,
    secretAdmirers: secretAdmirers
  };
};

Data.prototype.resetGameData = function (gameID) {
  const room = this.getGameRoom(gameID);
  if (!room) return;

  room.participants.forEach(p => {
    p.points = 0;
    p.laidVotes = [];
    p.hasSubmittedIndex = null;
    p.currentHandIndexes = [];
  });

  // Starta om rund-räknaren
  room.currentRound = {
    roundNumber: 0, // Markera att spelet inte har startat än
    submissions: {},
    votes: {},
    voteCount: 0,
    blackCardIndex: null
  };
};

Data.prototype.hasPlayerVoted = function (gameID, playerID) {
  const room = this.getGameRoom(gameID);
  if (!room) return false;
  
  const voter = room.participants.find(p => p.id === playerID);
  // Om antalet röster spelaren lagt är lika med nuvarande rundnummer, har de röstat
  return voter && voter.laidVotes.length >= room.currentRound.roundNumber;
};

export { Data };



