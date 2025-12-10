<template>
  <h1 id="lobbyName">{{ gameSettings.lobbyName }}</h1>
  <h1 id="gameCode">{{ uiLabels.lobbyView?.gameCode }} {{ gameID }}</h1>

  <section class="gridLayout">
    <div class="left-column">
      <p>Waiting for players <span class="loading"> ...</span></p>
      {{ participants }}

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
import Player from "../components/Player.vue";

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
    };
  },
  created: function () {
    this.gameID = this.$route.params.id;

    socket.on("updateParticipants", (p) => {
      this.participants = p;
    });

    const handleLobbyNotFound = () => {
      alert(`Lobby med kod ${this.gameID} hittades inte. Omdirigerar.`);
      this.$router.push("/join/");
    };

    socket.on("checkLobbyStatus", (data) => {
      if (!data.exists) {
        handleLobbyNotFound();
      } else {
        // Lobbyn finns! Fortsätt med att hämta data och ansluta.
        this.isValidLobby = true;
        this.fetchLobbyData();
      }
    });

    socket.emit("checkLobby", { gameID: this.gameID });

    socket.on("updateParticipants", (p) => (this.participants = p));
    socket.on("startPoll", () => this.$router.push("/poll/" + this.gameID));
    socket.on("gameSettings", (room) => {
      if (room && room.gameSettings) {
        this.gameSettings = room.gameSettings;
      } else {
        console.error("Kunde inte hämta spelinställningar trots giltigt ID.");
      }
    });
  },
  methods: {
    fetchLobbyData: function () {
      socket.emit("getGameSettings", this.gameID);
      socket.emit("joinLobbyScreen", this.gameID);
    },
    participateInPoll: function () {
      socket.emit("participateInPoll", { gameID: this.gameID, name: this.userName });
      this.joined = true;
    },
    toggleNav: function () {
      this.hideNav = !this.hideNav;
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
</style>
