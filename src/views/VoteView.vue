<template>
  <div class="vote-container">
    <div class="header-section">
      <h1>{{ uiLabels.voteView?.header}}</h1>
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
        {{ uiLabels.voteView?.vote }}
      </button>
      
      <div v-else class="waiting-message">
        <h3>{{ uiLabels.voteView?.voteReceived}}</h3>
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
.vote-container {
  padding: 20px;
  text-align: center;
}
.card-view {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  margin-bottom: 80px; /* Plats för footer */
}
.vote-card-wrapper {
  transition: transform 0.2s;
}
.selected-vote {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(0,0,0,0.3);
  border-radius: 8px; /* Matcha kortets hörn */
}
.footer-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: white; /* Eller genomskinlig/gradient */
  padding: 20px;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
}
.vote-btn {
  background-color: black;
  color: white;
  padding: 18px 50px;
  font-size: 1.3rem;
  border-radius: 50px;
  border: 2px solid #000;
  font-weight: bold;
  cursor: pointer;

  /* Gör animeringen mjuk och "studsig" */
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
  
  /* En subtil skugga för djup */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  
  /* Se till att texten inte markeras när man klickar snabbt */
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.vote-btn:hover:not(:disabled) {
  transform: translateY(-3px); /* Knappen lyfter */
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2); 
  background-color: #222; 
}

/* När man klickar (Active) */
.vote-btn:active:not(:disabled) {
  transform: translateY(1px); /* Knappen trycks ner */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Skuggan krymper */
  background-color: #000;
}

/* När knappen är inaktiverad (inget kort valt) */
.vote-btn:disabled {
  background-color: #e0e0e0; 
  border-color: #e0e0e0;
  color: #a0a0a0; 
  cursor: not-allowed;
  transform: none; 
  box-shadow: none; 
}

.card-view {
  padding: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
</style>

