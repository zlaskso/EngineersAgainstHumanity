<template>
  <div>
    <h1>{{ uiLabels.hostFinalView?.winnerIs }}</h1>

    <div class="price">
      <div class="col second">
        <div class="winner-name" id="winner2">{{ secondPlace()?.name }}</div>
        <div class="podium">2</div>
      </div>

      <div class="col first">
        <div class="winner-name" id="winner1">{{ firstPlace()?.name }}</div>
        <div class="podium">1</div>
      </div>

      <div class="col third">
        <div class="winner-name" id="winner3">{{ thirdPlace()?.name }}</div>
        <div class="podium">3</div>
      </div>
    </div>
  </div>
  <div class="button-container">
    <button class="default-btn" @click="playAgain">Spela igen</button>
  </div>
  <div class="ticker-wrap">
    <div class="ticker">
      <div v-for="n in 2" :key="n" class="ticker__group">
        <div v-for="(stat, i) in combinedStats" :key="i" class="ticker__item">
          <span class="stat-label">{{ stat.title }}:</span> {{ stat.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import io from "socket.io-client";
const socket = io();

export default {
  name: "FinalView",

  data() {
    return {
      gameID: "",
      localPlayerID: sessionStorage.getItem("playerID"),
      winnerNames: [],
      blackCardIndex: null,
      winningCardIndexes: [],
      allSubmittedCards: [],
      participants: [],
      playerWithSubmissions: {},
      funnyStats: null,
    };
  },
  props: {
    uiLabels: Object,
    uiCardLabels: Object,
  },

  created() {
    this.gameID = this.$route.params.id;

    socket.emit("join", this.gameID);
    socket.emit("getRoundResult", { gameID: this.gameID });

    socket.on("roundResult", (data) => {
      this.winnerNames = data.winnerNames || [];
      this.blackCardIndex = Number(data.blackCardIndex);
      this.winningCardIndexes = data.winningCardIndexes || [];
      this.allSubmittedCards = data.allSubmittedCards || [];
      this.participants = data.participants;
      socket.emit("getPlayerSubmissions", this.gameID);
      socket.emit("getFunnyStatistics", this.gameID);
    });

    socket.on("funnyStatistics", (data) => {
      console.log("STATISTIK MOTTAGEN FRÅN SERVER:", data);
      this.funnyStats = data;
    });
    socket.on("redirectToLobby", (data) => {
      // Alla spelare (och host) reagerar på detta och byter sida
      this.$router.push("/lobby/" + data.gameID);
    });
  },

  computed: {
    sortedParticipants() {
      const sorted = [...this.participants].sort((a, b) => b.points - a.points);
      console.log(sorted);
      return sorted;
    },

    // ... dina andra computed properties
    combinedStats() {
      if (!this.funnyStats) return [{ title: "INFO", text: "Beräknar statistik..." }];

      const s = this.funnyStats;
      const statsList = [];

      // Hantera Most Compatible
      if (s.mostCompatiblePairs.length > 0) {
        s.mostCompatiblePairs.forEach((pair) => {
          statsList.push({
            title: "BÄSTA KOMPISAR",
            text: `${pair.names.join(" & ")} (${pair.score} gemensamma röster!)`,
          });
        });
      }

      // Hantera Secret Admirers
      if (s.secretAdmirers.length > 0) {
        s.secretAdmirers.forEach((adm) => {
          statsList.push({
            title: "HEMLIG BEUNDRARE",
            text: `${adm.admirer} röstade på ${adm.target} ${adm.votesGiven} gånger!`,
          });
        });
      }

      // Hantera Least Compatible
      if (s.leastCompatiblePairs.length > 0) {
        s.leastCompatiblePairs.forEach((pair) => {
          statsList.push({
            title: "FRÄMLINGAR",
            text: `${pair.names.join(" & ")} har absolut ingen gemensam humor.`,
          });
        });
      }

      return statsList;
    },
  },
  methods: {
    firstPlace() {
      if (!this.sortedParticipants.length) return "Laddar...";
      return this.sortedParticipants[0];
    },
    secondPlace() {
      if (!this.sortedParticipants.length) return "Laddar...";
      console.log(this.sortedParticipants[0]);
      return this.sortedParticipants[1];
    },

    thirdPlace() {
      if (!this.sortedParticipants.length) return "Laddar...";
      return this.sortedParticipants[2];
    },
    playAgain() {
      socket.emit("playAgain", { gameID: this.gameID });
    },
  },
};
</script>

<style scoped>
h1 {
  text-align: center;
  margin-top: 60px;
  font-size: 4rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #000;
}
.price {
  margin-top: 10px;
  height: 400px;
  display: grid;
  font-size: 2rem;
  grid-template-columns: repeat(3, 15rem);
  grid-template-rows: auto 1fr;
  justify-content: center;
  gap: 1rem;
}

.col {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

.second,
.first,
.third {
  width: 15rem;
  font-size: 8rem;
  border-radius: 20px 20px 0 0;
  align-self: end;
}

.second {
  grid-column: 1;
  grid-row: 2;
}

.first {
  grid-column: 2;
  grid-row: 2;
}

@keyframes revealAnimation {
  0% {
    transform: translateY(20px) scale(0.5);
    opacity: 0;
  }
  60% {
    transform: translateY(-10px) scale(1.1);
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

#winner1,
#winner2,
#winner3 {
  opacity: 0;
  display: block;
  animation: revealAnimation 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

#winner3 {
  animation-delay: 0.5s;
}
#winner2 {
  animation-delay: 1s;
}
#winner1 {
  animation-delay: 1.5s;
}

.third {
  grid-column: 3;
  grid-row: 2;
}

.winner-name {
  font-size: 1.75rem;
  font-weight: 800;
  text-align: center;
  width: 100%;
  margin-bottom: 10px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.podium {
  width: 100%;
  background: white;
  border-radius: 20px 20px 0 0;
  border: 3px solid black;
  font-size: 10rem;
  display: flex;
  justify-content: center;
  align-items: top;
}

.first .podium {
  height: 100%;
}
.second .podium {
  height: 70%;
}
.third .podium {
  height: 50%;
}

.ticker-wrap {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 5rem;
  overflow: hidden;
  background-color: #000;
  border-top: 3px solid #fff;
  display: flex;
  align-items: center;
  z-index: 1000;
}

.ticker {
  display: flex;
  width: max-content;
  /* Öka från 10s till 30s eller 40s för mjukare gång */
  animation: scroll-horizontal 30s linear infinite;
  will-change: transform;
}

.ticker__group {
  display: flex;
  flex-shrink: 0;
  align-items: center;
}

.ticker__item {
  display: flex;
  align-items: center;
  padding: 0 4rem;
  color: #ffffff;
  font-size: 2.2rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
  white-space: nowrap;
}

.stat-label {
  color: #ffffff;
  font-weight: 900;
  margin-right: 15px;
}

@keyframes scroll-horizontal {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
.button-container {
  display: flex;
  justify-content: center;
  margin: 40px 0;
}

#winner1 {
  font-size: 2.3rem;
  color: black;
  margin-bottom: 20px;
}

@media (max-width: 800px) {
  .price {
    grid-template-columns: repeat(3, 1fr);
    width: 95vw;
    font-size: 1rem;
    gap: 0.5rem;
  }
  .podium {
    font-size: 4rem;
  }
  .winner-name {
    font-size: 1rem;
  }
  .ticker-wrap {
    height: 60px;
  }
  .ticker__item {
    font-size: 1.4rem;
    padding: 0 2rem;
  }
}
</style>
