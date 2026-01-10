<template>
  <div>
    <h1>{{ uiLabels.playerEndView?.thankYou }}</h1>
    <p>{{ $route.params.id }}</p>
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
};
</script>
