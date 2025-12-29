<template>
  <div class="vote-container">
    <div class="header-section">
      <h1>Rösta på det roligaste kortet!</h1>
    </div>
    
    <div class="card-view"> <div 
        v-for="(cardData, index) in cardsToVoteOn" 
        :key="index"
        class="vote-card-wrapper"
        :class="{ 'selected-vote': selectedVoteIndex === cardData.cardIndex }"
        @click="selectVote(cardData.cardIndex)"
      >
        <WhiteCard 
          v-if="uiCardLabels?.whiteCards"
          :prompt="uiCardLabels.whiteCards[cardData.cardIndex]" 
          :selected="selectedVoteIndex === cardData.cardIndex" 
        />
      </div>
    </div>

    <div class="footer-actions">
      <button 
        v-if="!hasVoted" 
        class="vote-btn" 
        @click="submitVote" 
        :disabled="selectedVoteIndex === null">
        {{ uiLabels.voteView?.vote || "Rösta" }}
      </button>
      
      <div v-else class="waiting-message">
        <h3>Röst mottagen!</h3>
        <p>Väntar på resultatet...</p>
      </div>
    </div>
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
      submittedAnswers: [],
      selectedVoteIndex: null,
      hasVoted: false,
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

  computed: {
    cardsToVoteOn() {
      return this.submittedAnswers.filter(
        (card) => card.playerID !== this.localPlayerID
      );
    },
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

    socket.on("votingPhaseStarted", (data) => {
      this.submittedAnswers = data.submissions;
    });


    socket.on("roundFinished", () => {
      this.$router.push("/result/" + this.gameID);
    })


  },


  methods: {

    selectVote(index) {
    if (!this.hasVoted) {
      this.selectedVoteIndex = index; // OBS: Måste matcha variabeln i data()
    }
  },

  submitVote() {
    // Kolla att man faktiskt har valt något
    if (this.selectedVoteIndex !== null) {
      socket.emit("submitVote", {
        gameID: this.gameID,
        voteCardIndex: this.selectedVoteIndex,
      });

      this.hasVoted = true; // Dölj knappen och visa "Tack för din röst"
    }
  },
    fetchLobbyData: function (gameID) {
      socket.emit("getGameSettings", gameID);
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

