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
  };

  room.participants.push(newPlayer);

  console.log("ADDING PLAYER:", newPlayer);
  console.log("ROOM NOW:", room.participants);

  return newPlayer;
};

Data.prototype.getParticipants = function (gameID) {
  if (this.roomExists(gameID)) {
    console.log("getParticipants -> Data.js", this.gameRooms[gameID].participants);
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
        submissions: {}, // { playerID: cardIndex }
        blackCardIndex: null
      }
    }
  } else {
    console.log("createGameRoom -> Data.js: Missing gameId or gameSettings");
  }
  console.log("createGameRoom -> Data.js", this.gameRooms[gameId]);
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

Data.prototype.saveSubmission = function (gameID, playerID, cardIndex) {
  const room = this.getGameRoom(gameID);
  if (room) {
    room.currentRound.submissions[playerID] = cardIndex;
  }
};

Data.prototype.prepareNextRound = function (gameID) {
  const room = this.getGameRoom(gameID);
  if (room) {
    room.currentRound.roundNumber++;
    room.currentRound.submissions = {}; // Clear old cards!
    console.log(`[DATA] Room ${gameID} moved to round ${room.currentRound.roundNumber}`);
  }
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

export { Data };



