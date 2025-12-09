'use strict';
import {readFileSync} from "fs";

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
  if (!["en", "sv"].some( el => el === lang))
    lang = "en";
  const labels = readFileSync("./server/data/labels-" + lang + ".json");
  return JSON.parse(labels);
}

Data.prototype.getUICardLabels = function (lang) {
  //check if lang is valid before trying to load the dictionary file
  if (!["en", "sv"].some( el => el === lang))
    lang = "en";
  const cardLabels = readFileSync("./server/cards-" + lang + ".json");
  return JSON.parse(cardLabels);
}

Data.prototype.getaboutExplanations = function (lang) {
  //check if lang is valid before trying to load the dictionary file
  if (!["en", "sv"].some( el => el === lang))
    lang = "en";
  const labels = readFileSync("./server/data/about-" + lang + ".json");
  return JSON.parse(labels);
}

Data.prototype.createPoll = function(pollId, lang="en") {
  
}

Data.prototype.participateInPoll = function(pollId, name) {
  console.log("participant will be added to", pollId, name);
  if (this.pollExists(pollId)) {
    console.log(this.gameRooms[pollId].participants.push(name))
  }
}

Data.prototype.getParticipants = function(pollId) {
  const poll = this.gameRooms[pollId];
  console.log("participants requested for", pollId);
  if (this.pollExists(pollId)) { 
    return this.gameRooms[pollId].participants
  }
  return [];
}

Data.prototype.createGameRoom = function(gameId, gameSettings, participants) {
  if (gameId && gameSettings) {
    this.gameRooms[gameId] = {
      gameSettings,
      participants: participants || []
    }
  }
}
Data.prototype.getGameRoom = function(gameID) {
  return this.gameRooms[gameID] || null;
};

export { Data };



