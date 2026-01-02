<template>
  <div class="result-container">
    
    <div v-if="amIHost" class="host-view">
      
      <div class="winner-section">
        <h1>{{ uiLabels.resultView?.roundWinner}}</h1>
        <h2 class="winner-name">{{ winnerName }}</h2>
        
        <div class="winning-combo">
          <BlackCard :cardText="blackCardText" />
          <WhiteCard :cardText="winningCardText" :selected="true" />
        </div>
      </div>

      <hr class="divider">

      <div class="others-section">
        <h3>{{ uiLabels.resultView?.otherCards }}</h3>
        
        <div class="cards-grid">
          <div v-for="(card, index) in losingCards" :key="index" class="small-card-wrapper">
            <WhiteCard :cardText="card.cardText" />
          </div>
        </div>
      </div>

      <div class="footer-actions">

        <button @click="nextRound" class="next-round-btn">
          {{ uiLabels.resultView?.nextRound}}
        </button>
      </div>

    </div>

    <div v-else class="player-waiting-view">
      <h1>{{ uiLabels.resultView?.WaitingForHost }}</h1>
      
      <div class="my-score-box">
        <h2>Din poäng</h2>
        <span class="score-number">{{ myScore }}</span>
      </div>
    </div>

  </div>
</template>

<script>
import io from "socket.io-client";
import BlackCard from "@/components/BlackCard.vue";
import WhiteCard from "@/components/WhiteCard.vue";

const socket = io("localhost:3000");

export default {
  name: "ResultView",
  components: {
    BlackCard,
    WhiteCard
  },
  props: {
    uiLabels: Object
  },
  data() {
    return {
      gameID: "",
      localPlayerID: sessionStorage.getItem("playerID"),
      winnerName: "Laddar...",
      blackCardText: "",
      winningCardText: "",
      allSubmittedCards: [], 
      participants: []
    };
  },
  computed: {
    amIHost() {
      return sessionStorage.getItem("hostPlayerID") !== null;
    },
    sortedParticipants() {
      return [...this.participants].sort((a, b) => b.points - a.points);
    },
    losingCards() {
      return this.allSubmittedCards.filter(
        c => c.cardText !== this.winningCardText
      );
    },
    // NY COMPUTED: Hämtar spelarens egna poäng
    myScore() {
      const me = this.participants.find(p => p.id === this.localPlayerID);
      return me ? me.points : 0;
    }
  },
  created() {
    this.gameID = this.$route.params.id;
    socket.emit("join", this.gameID);
    socket.emit("getRoundResult", { gameID: this.gameID });

    socket.on("roundResult", (data) => {
      this.winnerName = data.winner;
      this.blackCardText = data.blackCard;
      this.winningCardText = data.winningCard;
      this.allSubmittedCards = data.allSubmittedCards || []; 
      this.participants = data.participants;
    });

    socket.on("newRoundStarted", () => {
      if (this.amIHost) {
        this.$router.push(`/black/${this.gameID}`);
      } else {
        this.$router.push(`/cards/${this.gameID}`);
      }
    });

  },

  methods: {
    nextRound() {
      socket.emit("startNextRound", { gameID: this.gameID });
    }
  }
};
</script>

<style scoped>
.result-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0px;
  max-width: 1000px;
  margin: 0 auto;
}

/* --- Host View Styles --- */
.host-view {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.winner-section {
  text-align: center;
}

.winner-name {
  font-size: 2.5rem;
  color: #d35400;
  margin: 10px 0 30px 0;
}

.winning-combo {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 40px;
  transform: scale(0.9);
}

.divider {
  width: 100%;
  border: 1px solid #ddd;
  margin: 40px 0;
}

.others-section {
  width: 100%;
  text-align: center;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 0px;
  justify-items: center;
}

.small-card-wrapper {
  transform: scale(0.8); 
  opacity: 0.8;
}



.is-me {
  font-weight: bold;
}

.next-round-btn {
  background-color: black;
  color: white;
  padding: 20px 40px;
  font-size: 1.5rem;
  border-radius: 50px;
  cursor: pointer;
  border: none;
  transition: transform 0.2s;
}

.next-round-btn:hover {
  transform: scale(1.05);
}

/* --- Player Waiting View Styles --- */
.player-waiting-view {
  text-align: center;
  margin-top: 100px;
}

.waiting-subtext {
  color: gray;
  font-size: 1.2rem;
  margin-bottom: 40px;
}

.my-score-box {
  background: black;
  color: white;
  padding: 40px;
  border-radius: 20px;
  display: inline-block;
  min-width: 200px;
}

.score-number {
  font-size: 4rem;
  font-weight: bold;
  display: block;
  margin-top: 10px;
}
</style>