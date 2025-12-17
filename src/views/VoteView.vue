<template>
  <h1>
    {{ uiLabels.cardView?.pickFavourite }} {{ chosenIndexes }}{{ roundUsedIndexes }}
  </h1>
  <div class="card-view">
    <WhiteCard
      v-for="(i, idx) in chosenIndexes"
      :key="i"
      :index="idx"
      :prompt="uiCardLabels.whiteCards[i]"
      :selected="selectedIndex === idx"
      @select="setSelected"
    />
  </div>


</template>


<script>
    import WhiteCard from "@/components/WhiteCard.vue";
    import BlackCard from "@/components/blackCard.vue";
    import ResponsiveNav from "@/components/ResponsiveNav.vue";
    import io from "socket.io-client";
    const socket = io("localhost:3000");

    export default {
    name: "VoteView",
    components: {
    ResponsiveNav,
    WhiteCard,
    BlackCard,
    },

  data: function () {
    return {
      gameID: "inactive poll",
      localPlayerID: sessionStorage.getItem("playerID"),
      ResponsiveNav,
      chosenIndexes: [],
      selectedIndex: null,
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
  props: {
    uiLabels: Object,
    uiCardLabels: Object,
  },
  
  mounted: function () {
    socket.emit("getSubmissions", { 
    gameID: this.gameID, 
    playerID: this.localPlayerID 
    });
  },
  created: function () { 
    this.gameID = this.$route.params.id;

    socket.emit("join", this.gameID);

    socket.on("returnSubmissions", (submissions) => {
        this.chosenIndexes = Object.values(submissions);
    })
  },


  methods: {

    fetchLobbyData: function (gameID) {
      socket.emit("getGameSettings", gameID);
    },

    toggleNav: function () {
      this.hideNav = !this.hideNav;
    },
    setSelected(index) {
      this.selectedIndex = index;
    },
  },
};
</script>


<style scoped>
.card-view {
  padding: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
</style>

