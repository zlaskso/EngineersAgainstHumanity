<template>
  <div class="shared-view">
    <h1>{{ statusText }}</h1>

    <div class="blackcard-wrap">
      <BlackCard
        v-if="uiCardLabels?.blackCards && currentBlackIndex !== null"
        :prompt="uiCardLabels.blackCards[currentBlackIndex]"
      />
    </div>

    <div class="timer">
      {{ timeLeft }} {{ uiLabels.common?.secondsLeft }}
      <span v-if="gamePhase === 'SELECTION'">
        {{ uiLabels.blackCardView?.toSelect }}</span
      >
      <span v-if="gamePhase === 'VOTING'"> {{ uiLabels.blackCardView?.toVote }}</span>
    </div>
    <div class="stats-corner">
      <div class="currentRound">
        {{ uiLabels.blackCardView?.currentRound }} {{ roundCounter }}/{{
          gameSettings.numOfRounds
        }}
      </div>
      <div v-if="gamePhase == 'SELECTION'" class="currentRound">
        {{ uiLabels.blackCardView?.numOfSubmissions }} {{ numOfSubmissions }}/{{
          numOfPlayers
        }}
      </div>
      <div v-if="gamePhase == 'VOTING'" class="currentRound">
        {{ uiLabels.blackCardView?.numOfVotes }} {{ numOfVotes }}/{{ numOfPlayers }}
      </div>
    </div>
  </div>
</template>

<script>
import BlackCard from "@/components/BlackCard.vue";
import ResponsiveNav from "@/components/ResponsiveNav.vue";
import io from "socket.io-client";
const socket = io();

export default {
  name: "BlackCardView",
  components: {
    ResponsiveNav,
    BlackCard,
  },
  props: {
    uiLabels: Object,
    uiCardLabels: Object,
  },
  data: function () {
    return {
      currentBlackIndex: null,
      timeLeft: null,
      gamePhase: null,
      gameID: "",
      //timerId: 0,
      roundCounter: 0,
      numOfSubmissions: 0,
      numOfVotes: 0,
      numOfPlayers: 0,
      gameSettings: {
        lobbyName: "",
        numOfRounds: 0,
        cardsOnHand: 0,
        answerTime: 0,
        nrOfRerolls: 0,
      },
    };
  },

  computed: {
    statusText() {
      if (this.gamePhase === "VOTING") {
        return this.uiLabels.blackCardView?.votingPhase;
      }
      return this.uiLabels.blackCardView?.selectionPhase;
    },
  },
  created() {
    this.gameID = this.$route.params.id;
    socket.emit("getGameSettings", { gameID: this.gameID });
    socket.emit("join", this.gameID);
    socket.emit("requestCurrentTime", { gameID: this.gameID }); //fråga efter tid
    socket.on("timerUpdate", (data) => {
      if (data.timeLeft !== undefined) {
        this.timeLeft = data.timeLeft;
        console.log("Timer updated:", this.timeLeft);
      }
    });

    socket.on("gameSettings", (data) => {
      console.log("[CLIENT] Received gameSettings:", data);

      // lägger till gameSettings från servern
      this.gameSettings = {
        lobbyName: data.gameSettings.lobbyName,
        numOfRounds: data.gameSettings.numOfRounds,
        cardsOnHand: data.gameSettings.cardsOnHand,
        answerTime: data.gameSettings.answerTime,
        nrOfRerolls: data.gameSettings.nrOfRerolls,
      };
      this.hostID = data.hostID;
    });

    socket.on("connect", () => {
      socket.emit("join", this.gameID);
      // hämta samma svarta kort även vid omladdning
      socket.emit("requestCurrentBlackCard", { gameID: this.gameID });
      socket.emit("getRoundCounter", { gameID: this.gameID });
      socket.emit("getNumOfPlayers", { gameID: this.gameID });
    });

    socket.emit("getCurrentGamePhase", { gameID: this.gameID });

    socket.on("currentGamePhase", (data) => {
      console.log("Fas mottagen från server:", data.gamePhase);
      if (data.gamePhase === "VOTING") {
        this.gamePhase = "VOTING";
      } else {
        this.gamePhase = "SELECTION";
      }
      console.log("Fas är nu:", this.gamePhase);
    });

    socket.emit("getNumOfSubmissions", { gameID: this.gameID });

    socket.emit("getNumOfVotes", { gameID: this.gameID });

    // Lyssnare för svart kort
    socket.on("currentBlackCard", (data) => {
      if (data.blackCard !== undefined) {
        this.currentBlackIndex = data.blackCard;
      }
    });
    socket.on("roundCounter", (data) => {
      if (data.roundCounter !== undefined) {
        this.roundCounter = data.roundCounter;
      }
    });
    socket.on("numOfPlayers", (data) => {
      if (data.numOfPlayers !== undefined) {
        this.numOfPlayers = data.numOfPlayers;
      }
    });
    socket.on("numOfSubmissions", (data) => {
      if (data.numOfSubmissions !== undefined) {
        this.numOfSubmissions = data.numOfSubmissions;
      }
    });

    socket.on("numOfVotes", (data) => {
      if (data.numOfVotes !== undefined) {
        this.numOfVotes = data.numOfVotes;
      }
    });

    // Lyssna på fasbyte
    socket.on("votingPhaseStarted", () => {
      console.log("Server says: Voting phase started!");
      this.gamePhase = "VOTING";
    });

    // Lyssnare för RESULTAT
    socket.on("roundFinished", () => {
      this.$router.push(`/result/${this.gameID}`);
    });

    socket.on("newRoundStarted", (data) => {
      socket.emit("requestCurrentBlackCard", { gameID: this.gameID });
      console.log("Ny runda mottagen:", data);
      socket.emit("getRoundCounter", { gameID: this.gameID });
      socket.emit("getNumOfPlayers", { gameID: this.gameID });
      this.numOfSubmissions = 0; // Nollställ lokalt
      this.gamePhase = "SELECTION"; // Säkerställ att vi är i rätt fas
    });

    // Timer-logik
  },

  methods: {
    toggleNav() {
      this.hideNav = !this.hideNav;
    },
  },

  /*   beforeUnmount() {
  socket.off("timerUpdate");
  socket.off("newRoundStarted");
  socket.off("numOfSubmissions");
  console.log("Vy stängd, lyssnare rensade.");
} */
};
</script>

<style scoped>
.card-view {
  padding: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.blackcard-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  width: 25rem; /* kortets faktiska bredd */
  max-width: 80%; /* responsiv max-bredd */
  margin: 2rem auto; /* centrera */
  box-sizing: border-box;
}
.timer {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin-top: 20px;
}
.stats-corner {
  position: absolute;
  top: 20px;
  left: 20px;
  text-align: left;
  z-index: 10;
}

.currentRound {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
  font-family: sans-serif;
}
</style>
