<template>
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
const socket = io("localhost:3000");
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
#lobbyName {
  margin-top: 40px;
  font-size: 32pt;
}

#gameCode {
  color: gray;
  font-weight: normal;
  font-size: 20pt;
}

.gridLayout {
  margin-top: 60px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.playersName,
.finalGameRules {
  font-size: 20pt;
}
.left-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-size: 20pt;
}

.finalGameRules p {
  color: gray;
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
.player-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
.startGameButton {
  background: gray;
  align-self: center;
  width: fit-content;
  color: white;
  font-weight: bold;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  font-size: 1rem;
}
.startGameButton:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}
.startGameButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #ccc;
  box-shadow: none;
}
</style>
