<template>
  <div class="result-container">
    
    <div v-if="amIHost" class="host-view">
      
      <div class="winner-section">
        <h1>{{ uiLabels.resultView?.roundWinner}}</h1>
        <h2 class="winner-name">{{ formattedWinnerNames }}</h2>
        
      <div class="winning-combo">
        <div class="result-black-card">
          <BlackCard :prompt="uiCardLabels?.blackCards?.[blackCardIndex]" />
        </div>

        <div class="white-cards-column">
          <div class="winners-grid">
            <div v-for="(cardIndex, idx) in winningCardIndexes" :key="idx" class="winner-white-card">
              <WhiteCard :prompt="uiCardLabels?.whiteCards?.[cardIndex]"/>
            </div>
          </div>

          <div class="others-section">
            <div class="cards-grid">
              <div v-for="(card, index) in losingCards" :key="index" class="small-card-wrapper">
                <WhiteCard :prompt="uiCardLabels?.whiteCards?.[card.cardIndex]" />
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      <div class="footer-actions">
        <button @click="nextRound" class="next-round-btn">
          Time left: {{ this.timeLeft }}
        </button>
      </div>
    </div>

    <div v-else class="player-waiting-view">
      <h1>{{ uiLabels.resultView?.WaitingForHost }}</h1>
      
      <div class="my-score-box">
        <h1>{{ uiLabels.resultView?.yourScore }}</h1>
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
    uiLabels: Object,
    uiCardLabels: Object
  },

  data() {
    return {
      gameID: "",
      localPlayerID: sessionStorage.getItem("playerID"),
      winnerNames: [],
      blackCardIndex: null,
      winningCardIndexes: [],
      allSubmittedCards: [], 
      participants: [],
      timeLeft: 10,
      timerID: null
    };
  },

  computed: {
    amIHost() {
      return sessionStorage.getItem("hostPlayerID") !== null;
    },
    sortedParticipants() {
      return [...this.participants].sort((a, b) => b.points - a.points);
    },
    // Slår ihop alla namn med "&" emellan
    formattedWinnerNames() {
      if (!this.winnerNames || this.winnerNames.length === 0) return "Laddar...";
      return this.winnerNames.join(" & ");
    },
    // Filtrerar bort alla vinnarkort
    losingCards() {
      return this.allSubmittedCards.filter(
        c => !this.winningCardIndexes.includes(c.cardIndex)
      );
    },
    myScore() {
      const me = this.participants.find(p => p.id === this.localPlayerID);
      return me ? me.points : 0;
    }
  },

  created() {
    this.gameID = this.$route.params.id;
    socket.emit("join", this.gameID);
    socket.emit("getRoundResult", { gameID: this.gameID });

    if (this.amIHost) {
        this.startTimer();
      }

    socket.on("roundResult", (data) => {
      this.winnerNames = data.winnerNames || [];
      this.blackCardIndex = Number(data.blackCardIndex);
      this.winningCardIndexes = data.winningCardIndexes || [];
      this.allSubmittedCards = data.allSubmittedCards || []; 
      this.participants = data.participants;
    });

    socket.on("roundFinished", (data) => {
  this.winnerNames = data.winnerNames || [];
  this.blackCardIndex = Number(data.blackCardIndex);
  this.winningCardIndexes = data.winningCardIndexes || [];
  this.allSubmittedCards = data.allSubmittedCards || [];
  this.participants = data.participants || [];

  if (this.amIHost && !this.timerID) {
        this.startTimer();
      }
});

    socket.on("newRoundStarted", () => {
      if (this.timerID) {
        clearInterval(this.timerID);
      }
      if (this.amIHost) {
        this.$router.push(`/black/${this.gameID}`);
      } else {
        this.$router.push(`/cards/${this.gameID}`);
      }
    });

  },

  beforeUnmount() {
    if (this.timerID) {
      clearInterval(this.timerID);
    }
  },

  methods: {
    startTimer() {
      if (!this.amIHost) return;
      
      if (this.timerID) {
        clearInterval(this.timerID);
      };
      
      this.timeLeft = 10;

      this.timerID = setInterval(() => {
        this.timeLeft--; //Om ni vill stoppa timern så ni kan ändra koden utan att den går vidare automatiskt kan ni kommentera hela denna rad

          if (this.timeLeft <= 0) {
          clearInterval(this.timerID);
            this.timeID = null;
            this.timeLeft = 0;
            this.nextRound();
      }
      }, 1000);
    },
    nextRound() {
      if (this.timerID) {
        clearInterval(this.timerID);
        this.timerID = null;
      }

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
  align-items: left;
}

.winner-section {
  text-align: center;
}

.winner-name {
  font-size: 2.5rem;
  color: #d35400;
  margin: 10px 0 10px 0;
}

.result-black-card {
  height: 500px;
  transform-origin: top;
}

.winner-white-card {
  transform-origin: top left;
  transform: scale(0.9);
  border: black solid 2px;
  border-radius: 10px;
}

.winners-grid {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.winning-combo {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 10px;
  padding-top: 40px;
  }

  .white-cards-column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 10px;
}

.others-section {
  width: 100%;
  text-align: center;
  margin-left: -28px;
  margin-top: -80px;
  width: 650px;
}

.cards-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  overflow-x: hidden;
  gap: 0px;
}

.small-card-wrapper {
  margin-bottom: 0px;
  transform: scale(0.65); 
  opacity: 0.6;
  width: 160px; 
  height: 300px;
}

.is-me {
  font-weight: bold;
}

.footer-actions {
  display: flex;
  justify-content: center;
}

.next-round-btn {
  background-color: white;
  color: black;
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