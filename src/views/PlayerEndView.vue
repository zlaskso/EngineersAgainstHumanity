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
  <div>
    <h1>{{ uiLabels.playerEndView?.thankYou }}</h1>
  </div>
</template>
<script>
import io from "socket.io-client";
const socket = io();
export default {
  name: "PlayerEndView",

  data() {
    return {
      gameID: "",
      localPlayerID: sessionStorage.getItem("playerID"),
    };
  },

  props: {
    uiLabels: Object,
    uiCardLabels: Object,
  },

  created() {
    this.gameID = this.$route.params.id;
    socket.emit("join", this.gameID);
    socket.on("redirectToLobby", (data) => {
      console.log("Spelet startas om, skickar tillbaka till lobbyn...");
      this.$router.push("/lobby/" + data.gameID);
    });
  },

  methods: {
    homePage: function() {
    this.$router.push(`/`);
  },
  },
};
</script>
