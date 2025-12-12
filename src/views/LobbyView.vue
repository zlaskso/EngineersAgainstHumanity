<template>
  <h1 id="lobbyName">{{ gameSettings.lobbyName }}</h1>
  <h1 id="gameCode">{{ uiLabels.lobbyView?.gameCode }} {{ gameID }}</h1>

  <section class="gridLayout">
    <div class="left-column">
      <p>Waiting for players <span class="loading"> ...</span></p>
      <ul class="player-list">
        <li v-for="p in participants" :key="p.id">
          {{ p.name }}
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
      />
      <button v-if="iAmHost" @click="startGame" class="startGameButton">
        Starta spelet
      </button>
    </div>

    <div class="finalGameRules">
      <h2>{{ uiLabels.createView?.gameRules }}</h2>
      <p>{{ uiLabels.createView?.maxNumPlayers }} {{ gameSettings.maxPlayerAmount }}</p>
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
      gameID: "inactive poll",
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
    };
  },
  computed: {
    iAmHost() {
      console.log(
        "[CLIENT] hostSocketID:",
        this.hostSocketID,
        "my socket.id:",
        socket.id
      );

      return this.hostSocketID === socket.id;
    },
  },
  created: function () {
    this.gameID = this.$route.params.id;

    // Om vi har en sparad playerID = vi är en spelare; annars antas vi vara host
    const localPlayerID = localStorage.getItem("playerID");

    if (!localPlayerID) {
      // Antas host: registrera hostens lobby-skärm (sätter hostSocketID på servern)
      socket.emit("joinLobbyScreen", this.gameID);
    } else {
      // Är spelare: be om aktuell participants-lista och spelinställningar
      socket.emit("getParticipantsList", this.gameID);
      socket.emit("getGameSettings", this.gameID);
    }

    // Gemensamma socket-lyssnare (logg för debugging)
    socket.on("updateParticipants", (p) => {
      console.log("[CLIENT] updateParticipants received:", p);
      this.participants = p;
    });

    socket.on("gameSettings", (room) => {
      console.log("[CLIENT] Received gameSettings:", room);
      this.gameSettings = room.gameSettings;
      this.hostSocketID = room.hostSocketID;
      console.log(
        "[CLIENT] hostSocketID:",
        this.hostSocketID,
        "my socket.id:",
        socket.id
      );
    });

    socket.on("checkLobbyStatus", (data) => {
      if (!data.exists) {
        alert(`Lobby med kod ${this.gameID} hittades inte. Omdirigerar.`);
        this.$router.push("/join/");
      } else {
        this.isValidLobby = true;
        // fetchLobbyData anropas inte nödvändigt här eftersom vi anropar getGameSettings/getParticipantsList direkt
      }
    });

    socket.on("gameStarted", (data) => {
      if (socket.id === data.hostSocketID) {
        this.$router.push(`/black/${this.gameID}`);
      } else {
        this.$router.push(`/cards/${this.gameID}`);
      }
    });

    // Fråga att kolla om lobbyn existerar
    socket.emit("checkLobby", { gameID: this.gameID });
  },

  methods: {
    fetchLobbyData: function () {
      socket.emit("getGameSettings", this.gameID);
    },
    participateInPoll: function () {
      socket.emit("participateInPoll", { gameID: this.gameID, name: this.userName });
      this.joined = true;
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
  /* Använd Flexbox eller en intern Grid för att stapla elementen i VÄNSTER kolumn */
  display: flex;
  flex-direction: column; /* Stapla .playersName och alla Player-komponenter vertikalt */
  gap: 20px; /* Lägg till lite utrymme mellan spelarna */
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
  list-style-type: none; /* tar bort prickarna */
  padding: 0; /* tar bort indrag */
  margin: 0;
}
</style>
