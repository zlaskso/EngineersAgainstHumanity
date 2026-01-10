<template>
  <div>
    <p>Game: {{ $route.params.id }}</p>
    <h1>Vinnaren är:</h1>

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
  <div class="ticker-wrap">
    <div class="ticker">
      <div v-for="n in 2" :key="'group-' + n" class="ticker__group">
        <div 
        class="ticker__item" 
        v-for="(stat, i) in combinedStats" 
        :key="`g${n}-i${i}-${stat.title}-${stat.text}`">
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
      funnyStats: null, // Ny variabel
    };
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

    socket.on("roundFinished", (data) => {
      this.winnerNames = data.winnerNames || [];
      this.blackCardIndex = Number(data.blackCardIndex);
      this.winningCardIndexes = data.winningCardIndexes || [];
      this.allSubmittedCards = data.allSubmittedCards || [];
      this.participants = data.participants || [];
    });
    socket.on("funnyStatistics", (data) => {
      console.log("STATISTIK MOTTAGEN FRÅN SERVER:", data);
      this.funnyStats = data;
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
  },
};
</script>

<style scoped>
.price {
  margin-top: 100px;
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

@keyframes reavealAnimation {
  0% {
    transform: scaleY(0);
    opacity: 1;
  }
  0.5% {
    transform: scaleY(1.5);
    opacity: 1;
  }
  0.7% {
    transform: scaleY(0.9);
    opacity: 1;
  }
  1% {
    transform: scaleY(1.1);
    opacity: 1;
  }
  2% {
    transform: scaleY(1);
    opacity: 1;
  }
}

.third {
  grid-column: 3;
  grid-row: 2;
}

.winner-name {
  font-size: 1.5rem;
  text-align: center;
  width: 100%;
  margin-bottom: 10px;
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

/* Själva behållaren längst ner på skärmen */
.ticker-wrap {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 6rem;
  overflow: hidden; /* Döljer texten utanför skärmen */
  background-color: rgba(0, 0, 0, 0.9);
  padding: 15px 0;
  z-index: 100;

  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
}

.ticker {
  display: inline-flex;
  white-space: nowrap;
  align-items: center;
  animation: scroll-horizontal 40s linear infinite;
}

.ticker__group {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
}

.ticker__item {
  padding: 0 3rem;
  color: white;
  font-size: 1.8rem;
}

.stat-label {
  color: white;
  font-weight: bold;
  margin-right: 10px;
}

/* Animationen som flyttar texten */
@keyframes scroll-horizontal {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}

/* Fix för din reveal-animation (ändra duration från 800s till något rimligt) */
#winner1,
#winner2,
#winner3 {
  opacity: 1; /* Ändra till 1 så de syns efter animationen */
  animation: reavealAnimation 2s ease-out forwards;
}
</style>
