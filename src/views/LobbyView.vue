<template>
  <header>
    <div v-bind:class="['hamburger', {'close': !hideNav}]" 
         v-on:click="toggleNav">
    </div>
    <button class="logo" @click="homePage">
      <img src="/img/logo.png">
      Engineers Against Humanity
    </button>
  </header>
  <h1 id="lobbyName">{{ gameSettings.lobbyName }}</h1>
  <h1 id="gameCode">{{ uiLabels.lobbyView?.gameCode }} {{ gameID }}</h1>

  <section class="gridLayout">
    <div class="left-column">
      <p>{{ uiLabels.lobbyView?.waitingForPlayers }} <span class="loading"> ...</span></p>
      <ul class="player-list">
        <li v-for="p in participants" :key="p.id">
          <span v-if="p.id === localPlayerID"
            ><b>{{ p.name }}</b></span
          >
          <span v-else>{{ p.name }}</span>
        </li>
      </ul>

      <Player
        v-for="p in participants"
        :key="p.id"
        :id="p.id"
        :userName="p.name"
        :isHost="p.isHost"
        :hasPickedCard="p.hasPickedCard"
        :totalNumPoints="p.points"
        :isActive="p.isActive"
        :rerollsLeft="p.rerollsLeft"
      />
      <button
        v-if="amIHost"
        @click="startGame"
        class="startGameButton"
        :disabled="participants.length < 1"
      >
        {{ uiLabels.lobbyView?.startGame }}
      </button>
    </div>

    <div class="finalGameRules">
      <h2>{{ uiLabels.createView?.gameRules }}</h2>
      <p>{{ uiLabels.createView?.numOfRounds }} {{ gameSettings.numOfRounds }}</p>
      <p>{{ uiLabels.createView?.cardsOnHand }} {{ gameSettings.cardsOnHand }}</p>
      <p>{{ uiLabels.createView?.answerTime }} {{ gameSettings.answerTime }}</p>
      <p>{{ uiLabels.createView?.nrOfRerolls }} {{ gameSettings.nrOfRerolls }}</p>
    </div>
  </section>
</template>

<script>
import io from "socket.io-client";
const socket = io();
import Player from "@/components/Player.vue";

export default {
  name: "LobbyView",

  props: {
    uiLabels: Object,
  },

  data: function () {
    return {
      userName: "",
      gameID: "inactive game",
      joined: false,
      participants: [],
      isValidLobby: false,
      gameSettings: {
        lobbyName: "",
        maxPlayerAmount: 0,
        numOfRounds: 0,
        cardsOnHand: 0,
        answerTime: 0,
        nrOfRerolls: 0,
      },
      hostSocketID: null,
      localPlayerID: sessionStorage.getItem("playerID"), // spelaren själv
    };
  },
  computed: {
    amIHost() {
      return sessionStorage.getItem("hostPlayerID") != undefined;
    },
  },

  created: function () {
    this.gameID = this.$route.params.id;
    console.log("Socket connection status:", socket.connected);
    socket.emit("joinLobbyPlayer", { gameID: this.gameID });

    const localPlayerID = sessionStorage.getItem("playerID"); //finns endast om spelare annars är host

    socket.emit("getParticipantsList", this.gameID);
    socket.emit("getGameSettings", { gameID: this.gameID });

    // Gemensamma socket-lyssnare (logg för debugging)
    socket.on("updateParticipants", (p) => {
      console.log("[CLIENT] updateParticipants received:", p);
      this.participants = p;
    });

    socket.on("gameSettings", (data) => {
      console.log("[CLIENT] Received gameSettings:", data);

      // lägger till gameSettings från servern
      this.gameSettings = {
        lobbyName: data.gameSettings.lobbyName,
        numOfRounds: data.gameSettings.numOfRounds,
        cardsOnHand: data.gameSettings.cardsOnHand,
        answerTime: data.gameSettings.answerTime,
        nrOfRerolls: data.gameSettings.nrOfRerolls,
      };
      this.hostID = data.hostID;
    });

    socket.on("checkLobbyStatus", (data) => {
      if (!data.exists) {
        alert(`Lobby med kod ${this.gameID} hittades inte. Omdirigerar.`);
        this.$router.push("/join/");
      } else {
        this.isValidLobby = true;
      }
    });

    socket.on("gameStarted", (data) => {
      if (this.amIHost) {
        this.$router.push(`/black/${this.gameID}`);
      } else {
        this.$router.push(`/cards/${this.gameID}`);
      }
    });

    // finns lobbyn?
    socket.emit("checkLobby", { gameID: this.gameID });
  },

  methods: {
    fetchLobbyData: function () {
      socket.emit("getGameSettings", this.gameID);
    },
    toggleNav: function () {
      this.hideNav = !this.hideNav;
    },
    startGame() {
      socket.emit("startGame", { gameID: this.gameID });
    },
    homePage: function() {
    this.$router.push(`/`);
  }
  },
  beforeDestroy() {
    socket.off("lobbyNotFound");
    socket.off("checkLobbyStatus");
    socket.off("participantsUpdate");
    socket.off("startPoll");
    socket.off("gameSettings");
  },
};
</script>

<style scoped>
/*
   DEL 1: MOBIL

/* Rubriker */
#lobbyName {
  margin-top: 100px;
  font-size: clamp(2rem, 5vw, 3rem);
  text-align: center;
  line-height: 1.1;
  word-break: break-word; 
}

#gameCode {
  color: gray;
  font-weight: normal;
  font-size: clamp(1.2rem, 4vw, 1.5rem);
  text-align: center;
  margin-bottom: 10px;
}


.gridLayout {
  margin-top: 20px;
  display: flex;     
  flex-direction: column;
  gap: 30px;
  padding: 0 10px;   
}


.left-column {
  display: flex;
  flex-direction: column;
  gap: 15px;
  font-size: 1.2rem;
  width: 100%;
}


.finalGameRules {
  font-size: 1rem;
  background: #f9f9f9; 
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #eee;
  text-align: center;
}

.finalGameRules h2 {
  font-size: 1.7rem;
  margin-bottom: 10px;
}

.finalGameRules p {
  color: #666;
  margin: 5px 0;
  font-size: 1.5rem;
}


.player-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  text-align: center;
}

.player-list li {
  background: white;
  border-bottom: 1px solid #eee;
  padding: 10px;
  margin-bottom: 5px;
}


.startGameButton {
  background: black;
  color: white;
  font-weight: bold;
  
  width: 100%;
  max-width: 400px; 
  align-self: center;

  padding: 18px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  
  font-size: 1.2rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
  
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.startGameButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #ccc;
  box-shadow: none;
}

.loading {
  width: 60px;
  aspect-ratio: 4;
  clip-path: inset(0 100% 0 0);
  animation: l1 1s steps(4) infinite;
}
@keyframes l1 {
  to {
    clip-path: inset(0 -34% 0 0);
  }
}


/* 
   DEL 2: DESKTOP (STORA SKÄRMAR)
 */
@media (min-width: 900px) {
  
  #lobbyName {
    margin-top: 40px;
  }

  .gridLayout {
    margin-top: 60px;
    display: grid;   
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    max-width: 1000px; 
    margin-left: auto;
    margin-right: auto;
  }

  .left-column {
    font-size: 1.5rem;
  }

  .startGameButton {
    width: auto;
    padding: 15px 40px;
    font-size: 1.3rem;
  }

  .startGameButton:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    background-color: #333;
  }

  .finalGameRules {
    text-align: left;
    background: none;
    border: none;
    padding: 0;
  }
  
  .player-list {
    text-align: left;
  }
  
  .player-list li {
    background: none;
    border: none;
    border-bottom: 1px solid #eee;
    padding: 10px 0;
    margin-bottom: 0;
    border-radius: 0;
  }
}
</style>