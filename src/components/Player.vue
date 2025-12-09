<template></template>

<script>
import io from "socket.io-client";
const socket = io("localhost:3000");

export default {
  data: function () {
    return {
      userName: "",
      gameID: null,
      isjoined: false,
      isHost: false,
      hasPickedCard: false,
      currentPickedCard: null,
      totalNumPoints: 0,
    };
  },
  props: {
    //  uiLabels: Object,
  },
};
</script>

<style scoped></style>
