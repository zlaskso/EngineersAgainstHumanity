<template>
  <h1>{{ uiLabels.lobbyView?.gameCode }} {{ gameID }}</h1>
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
  <h2>{{ uiLabels.createView?.gameRules }}</h2>
  <p> {{ uiLabels.createView?.maxNumPlayers }} {{ gameSettings.maxPlayerAmount }}</p>
  <p>{{ uiLabels.createView?.numOfRounds }} {{ gameSettings.numOfRounds }}</p>
  <p> {{ uiLabels.createView?.cardsOnHand }} {{ gameSettings.cardsOnHand }}</p>
  </section>
</template>

<script>
import io from "socket.io-client";
const socket = io("localhost:3000");

export default {
  name: "LobbyView",
  
  props: {
    uiLabels: Object
  },

  data: function () {
    return {
      userName: "",
      gameID: "inactive poll",
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
    socket.on("participantsUpdate", (p) => (this.participants = p));
    socket.on("startPoll", () => this.$router.push("/poll/" + this.gameID));
    socket.emit("joinPoll", this.gameID);
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
    toggleNav: function () {
      this.hideNav = !this.hideNav;
    },
  },
};
</script>

<style scoped>
</style>
