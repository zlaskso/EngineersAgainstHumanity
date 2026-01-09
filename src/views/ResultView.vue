<template>
  <div class="result-container">
    <div v-if="amIHost" class="host-view">
      <div class="winner-section">
        <h1>{{ uiLabels.resultView?.roundWinner }}</h1>
        <h2 class="winner-name">{{ formattedWinnerNames }}</h2>

        <div class="winning-combo">
          <div class="result-black-card">
            <BlackCard :prompt="uiCardLabels?.blackCards?.[blackCardIndex]" />
          </div>

          <div class="white-cards-column">
            <div class="winners-grid">
              <div
                v-for="(cardIndex, idx) in winningCardIndexes"
                :key="idx"
                class="winner-white-card"
                :style="dynamicWinnerStyle"
              >
                <WhiteCard
                  :prompt="uiCardLabels?.whiteCards?.[cardIndex]"
                  :playerName="playerWithSubmissions[cardIndex]"
                  :showName="true"
                />
              </div>
            </div>

            <div class="others-section">
              <div class="cards-grid">
                <div
                  v-for="(card, index) in losingCards"
                  :key="index"
                  class="small-card-wrapper"
                >
                  <WhiteCard
                    :prompt="uiCardLabels?.whiteCards?.[card.cardIndex]"
                    :playerName="playerWithSubmissions[card.cardIndex]"
                    :showName="true"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="footer-actions">
        <button
          v-if="currentRoundNumber < totalRounds"
          @click="nextRound"
          class="next-round-btn"
        >
          {{ uiLabels.resultView?.nextRound }} {{ timeLeft }}
        </button>

        <button v-else @click="nextRound" class="next-round-btn final-btn">
          {{ uiLabels.resultView?.seeFinalScore }} {{ timeLeft }}
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

const socket = io();

export default {
  name: "ResultView",
  components: {
    BlackCard,
    WhiteCard,
  },

  props: {
    uiLabels: Object,
    uiCardLabels: Object,
  },

  data() {
    return {
      gameID: "",
      localPlayerID: sessionStorage.getItem("playerID"),
      currentRoundNumber: 0,
      totalRounds: 0,
      winnerNames: [],
      blackCardIndex: null,
      winningCardIndexes: [],
      allSubmittedCards: [],
      participants: [],
      playerWithSubmissions: {},
      timeLeft: null,
      timerID: null,
      columnWidth: 600, // Available width for winning cards
      baseCardWidth: 200, // Original width from WhiteCard.vue
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
      const winningIds = this.winningCardIndexes.map((id) => Number(id));
      return this.allSubmittedCards.filter((submission) => {
        return !winningIds.includes(Number(submission.cardIndex));
      });
    },
    myScore() {
      const me = this.participants.find((p) => p.id === this.localPlayerID);
      return me ? me.points : 0;
    },
    dynamicWinnerStyle() {
      const count = this.winningCardIndexes.length || 1;
      const totalGap = 10 * (count - 1);
      const availableSpace = this.columnWidth - totalGap;

      // Calculate max width allowed per card to stay within 650px
      const allowedWidthPerCard = availableSpace / count;
      let calculatedScale = allowedWidthPerCard / this.baseCardWidth;

      // Cap scale at 0.9 so single winners aren't too massive
      const finalScale = Math.min(0.9, calculatedScale);

      return {
        transform: `scale(${finalScale})`,
        transformOrigin: "top left",
      };
    },
  },

  created() {
    this.gameID = this.$route.params.id;
    socket.emit("join", this.gameID);
    socket.emit("getRoundResult", { gameID: this.gameID });

    socket.emit("getGameSettings", { gameID: this.gameID });
    socket.on("gameSettings", (data) => {
      this.totalRounds = data.gameSettings.numOfRounds;
    });

    socket.emit("getRoundCounter", { gameID: this.gameID });
    socket.on("roundCounter", (data) => {
      this.currentRoundNumber = data.roundCounter;
    });

    if (this.amIHost) {
      socket.emit("requestCurrentTime", { gameID: this.gameID }); // NYTT: Fråga efter tid direkt
      socket.on("timerUpdate", (data) => {
        if (data.timeLeft !== undefined) {
          this.timeLeft = data.timeLeft;
          console.log("Timer updated:", this.timeLeft);
        }
      });
    }

    socket.on("roundResult", (data) => {
      this.winnerNames = data.winnerNames || [];
      this.blackCardIndex = Number(data.blackCardIndex);
      this.winningCardIndexes = data.winningCardIndexes || [];
      this.allSubmittedCards = data.allSubmittedCards || [];
      this.participants = data.participants;
      socket.emit("getPlayerSubmissions", this.gameID);
    });

    socket.on("roundFinished", (data) => {
      this.winnerNames = data.winnerNames || [];
      this.blackCardIndex = Number(data.blackCardIndex);
      this.winningCardIndexes = data.winningCardIndexes || [];
      this.allSubmittedCards = data.allSubmittedCards || [];
      this.participants = data.participants || [];
      /* 
      if (this.amIHost && !this.timerID) {
        this.startTimer();
      } */
      socket.emit("getPlayerSubmissions", this.gameID);
    });
    socket.on("newRoundStarted", () => {
      /*       if (this.timerID) {
        clearInterval(this.timerID);
      } */
      if (this.amIHost) {
        this.$router.push(`/black/${this.gameID}`);
      } else {
        this.$router.push(`/cards/${this.gameID}`);
      }
    });

    socket.on("returnSubmissions", (submissions) => {
      this.playerWithSubmissions = submissions;
    });

    socket.on("gameSeshOver", () => {
      console.log("Game session over received");

      if (this.amIHost) {
        console.log("Navigating to FinalView as host");
        this.$router.push(`/final/${this.gameID}`);
      } else {
        console.log("Navigating to EndView as player");
        this.$router.push(`/end/${this.gameID}`);
      }
    });
  },

  /*   beforeUnmount() {
    if (this.timerID) {
      clearInterval(this.timerID);
    }
  }, */

  methods: {
    nextRound() {
      socket.emit("startNextRound", { gameID: this.gameID });
    },
  },
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
  border: black solid 2px;
  border-radius: 12px;
  background: white;
  overflow-x: auto;
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
  width: 600px;
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
  transform-origin: "top left";
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
