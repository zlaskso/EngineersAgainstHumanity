'use strict';
import { readFileSync } from "fs";

// Store data in an object to keep the global namespace clean. In an actual implementation this would be interfacing a database...
function Data() {
  this.gameRooms = {};
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
    existingPlayer.name = name; // om spelaren bytt namn vid reconnect

    return existingPlayer; // skapar ingen
  }

  // 2️⃣ Skapa ny spelare
  const newPlayer = {
    id: playerID,       // använd det ID som klienten skickade med
    socketID: socketID, // socket.id
    name: name,
    isHost: false,
    isActive: true,
  };

  room.participants.push(newPlayer);

  console.log("ADDING PLAYER:", newPlayer);
  console.log("ROOM NOW:", room.participants);

  return newPlayer;
};

//test2
Data.prototype.getParticipants = function (gameID) {
  if (this.roomExists(gameID)) {
    console.log("getParticipants -> Data.js", this.gameRooms[gameID].participants);
    return this.gameRooms[gameID].participants;
  }
  return [];
};

Data.prototype.createGameRoom = function (gameId, gameSettings, hostID, participants) {
  if (gameId && gameSettings) {
    this.gameRooms[gameId] = {
      gameSettings,
      hostID: hostID,
      participants: participants || [], //Om participants finns och inte är null/undefined → använd det.|| betyder “eller”.
    }
  }
  console.log("createGameRoom -> Data.js", this.gameRooms[gameId]);
}

Data.prototype.getGameRoom = function (gameID) {
  return this.gameRooms[gameID] || null;
};

export { Data };



