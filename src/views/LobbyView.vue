<template>
  <div class="lang-switch" v-on:click="switchLanguage">
    <span v-if="lang === 'sv'">🇸🇪</span>
    <span v-else>🇬🇧</span>
  </div>
  <h1>{{ uiLabels.gameCode }} {{ gameID }}</h1>
  <!--

  <div>
    <div v-if="!joined">
      <input type="text" v-model="userName" />
      <button v-on:click="participateInPoll">
        {{ this.uiLabels.participateInPoll }}
      </button>
    </div>
    <div v-if="joined">
      <p>Waiting for host to start poll</p>
      {{ participants }}
    </div>
  </div>
  -->


  <h1>{{ gameSettings.lobbyName }}</h1>

  <section class="finalGameRules">
  <h2>{{ uiLabels.gameRules }}</h2>
  <p> {{ uiLabels.maxNumPlayers }} {{ gameSettings.maxPlayerAmount }}</p>
  <p>{{ uiLabels.numOfRounds }} {{ gameSettings.numOfRounds }}</p>
  <p> {{ uiLabels.cardsOnHand }} {{ gameSettings.cardsOnHand }}</p>
  </section>
</template>

<script>
import io from "socket.io-client";
const socket = io("localhost:3000");

export default {
  name: "LobbyView",
  data: function () {
    return {
      userName: "",
      gameID: "inactive poll",
      uiLabels: {},
      joined: false,
      participants: [],
      gameSettings: {
        lobbyName: "",
        maxPlayerAmount: 0,
        numOfRounds: 0,
        cardsOnHand: 0,
      },
    };
  },
  created: function () {
    this.gameID = this.$route.params.id;
    socket.on("uiLabels", (labels) => (this.uiLabels = labels));
    socket.on("participantsUpdate", (p) => (this.participants = p));
    socket.on("startPoll", () => this.$router.push("/poll/" + this.gameID));
    socket.emit("joinPoll", this.gameID);
    socket.emit("getUILabels", this.lang);
    socket.emit("getGameSettings", this.gameID);
    socket.on("gameSettings", (room) => {
    if (room) {
      this.gameSettings = room.gameSettings;
    }
    });
  },
  methods: {
    participateInPoll: function () {
      socket.emit("participateInPoll", { gameID: this.gameID, name: this.userName });
      this.joined = true;
    },
    switchLanguage: function () {
      if (this.lang === "en") {
        this.lang = "sv";
      } else {
        this.lang = "en";
      }
      localStorage.setItem("lang", this.lang);
      socket.emit("getUILabels", this.lang);
    },
    toggleNav: function () {
      this.hideNav = !this.hideNav;
    },
  },
};
</script>

<style scoped>
.lang-switch {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 3rem;
  cursor: pointer;
  display: flex;
  user-select: none;
  user-select: none;
  -webkit-user-select: none;
}
.lang-switch:active {
  transform: scale(0.9);
}
</style>
