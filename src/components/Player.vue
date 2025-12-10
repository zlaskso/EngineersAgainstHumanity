<template>
  <!-- Tomt: Player är bara en logikbehållare -->
</template>

<script>
//import io from "socket.io-client";
//const socket = io("localhost:3000");

export default {
  data: function () {
    return {
      //lokala states för spelaren
      //gameID: null,
      //isjoined: false,
      //currentPickedCard: null,
      //totalNumPoints: 0,
    };
  },
  props: {
    userName: { type: String, required: true },
    isHost: { type: Boolean, default: false },
    hasPickedCard: { type: Boolean, default: false },
    totalNumPoints: { type: Number, default: 10 },
    isActive: { type: Boolean, default: false },
    id: { type: String, required: true }, // socketID eller server-ID
    //  uiLabels: Object,
  },
};
</script>

<style scoped></style>
