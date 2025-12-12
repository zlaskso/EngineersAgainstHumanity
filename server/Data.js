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

Data.prototype.pollExists = function (pollId) {
  return typeof this.gameRooms[pollId] !== "undefined"
}

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


Data.prototype.participateInGame = function (gameID, name, socketID, reconnectID = null) {
  const room = this.getGameRoom(gameID);
  if (!room) return null;

  // 1. Reconnect om reconnectID finns
  if (reconnectID) {
    const existingPlayer = room.participants.find(
      (p) => p.id === reconnectID
    );

    if (existingPlayer) {
      console.log("RECONNECTING PLAYER:", existingPlayer.name);

      // uppdatera socket-id till den nya anslutningen
      existingPlayer.socketID = socketID;
      existingPlayer.isActive = true;

      return existingPlayer; // ❗ AVBRYT – skapa INGEN ny spelare
    }
  }

  // 2. Annars skapa ny spelare
  const newPlayer = {
    id: Math.random().toString(36).substring(2, 10), // permanent ID
    socketID,  // socket.id
    name,
    //points: 0,
    // props
    isHost: false,
    //hasPickedCard: false, 
    isActive: true // Antar att de är aktiva när de ansluter
  };

  room.participants.push(newPlayer);
  console.log("ADDING PLAYER:", newPlayer);
  console.log("ROOM NOW:", room.participants);
  return newPlayer;
};
//test2
Data.prototype.getParticipants = function (gameID) {
  if (this.pollExists(gameID)) {
    return this.gameRooms[gameID].participants;
  }
  return [];
};

Data.prototype.createGameRoom = function (gameId, gameSettings, participants) {
  if (gameId && gameSettings) {
    this.gameRooms[gameId] = {
      gameSettings,
      participants: participants || [], //Om participants finns och inte är null/undefined → använd det.|| betyder “eller”.
      hostSocketID: null
    }
  }
}
Data.prototype.getGameRoom = function (gameID) {
  return this.gameRooms[gameID] || null;
};

export { Data };



