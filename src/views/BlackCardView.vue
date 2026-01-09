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
    <div>Current round {{ this.roundCounter }}/{{ this.gameSettings.numOfRounds }}</div>
  </div>
</template>

<script>
import BlackCard from "@/components/BlackCard.vue";
import ResponsiveNav from "@/components/ResponsiveNav.vue";
import io from "socket.io-client";
const socket = io("localhost:3000");

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
      timeLeft: 10,
      gamePhase: "SELECTION",
      gameID: "",
      answerTime: 20, // Sparar tiden från inställningarna
      timerId: null,
      roundCounter: 0,
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
    statusText() {
      if (this.gamePhase === "VOTING") {
        return this.uiLabels.blackCardView?.votingPhase;
      }
      return this.uiLabels.blackCardView?.selectionPhase;
    },
  },
  // VIKTIGT: Allt ligger nu i EN enda created-funktion
  created() {
    this.gameID = this.$route.params.id;
    socket.emit("getGameSettings", { gameID: this.gameID });

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
      // Hämta aktuellt svart kort om man laddar om sidan
      socket.emit("requestCurrentBlackCard", { gameID: this.gameID });
      socket.emit("getRoundCounter", { gameID: this.gameID });
    });

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

    // Lyssnare för FAS-BYTE (När servern säger att vi ska rösta)
    socket.on("votingPhaseStarted", () => {
      console.log("Server says: Voting phase started!");
      this.gamePhase = "VOTING";
      this.timeLeft = 30; // Ge spelarna 30 sekunder att rösta
    });

    // Lyssnare för RESULTAT
    socket.on("roundFinished", () => {
      this.$router.push(`/result/${this.gameID}`);
    });

    socket.on("newRoundStarted", () => {
      this.currentBlackIndex = null;
      socket.emit("requestCurrentBlackCard", { gameID: this.gameID });
    });
  },

  mounted() {
    this.startTimer();
  },

  methods: {
    startTimer() {
      // 1. Hämta inställningar först för att få rätt tid
      socket.emit("getGameSettings", { gameID: this.gameID });

      socket.once("gameSettings", (d) => {
        this.answerTime = d.gameSettings.answerTime || 20;
        this.timeLeft = this.answerTime;

        // Starta intervallet
        const interval = setInterval(() => {
          this.timeLeft--;

          if (this.timeLeft < 0) {
            if (this.gamePhase === "SELECTION") {
              // Tiden ute för att VÄLJA -> Be servern starta röstning
              // Vi nollställer inte tiden här, vi väntar på "votingPhaseStarted"
              // för att vara säkra på att servern är med.
              if (this.timeLeft === -1) {
                // Kör bara en gång precis när den går under 0
                console.log("Time up! Requesting vote phase...");
                socket.emit("startVotePhase", this.gameID);
              }
            } else if (this.gamePhase === "VOTING") {
              // Tiden ute för att RÖSTA -> Gå till resultat
              console.log("Voting time up!");
              clearInterval(interval);
              // Tvinga fram resultat om servern inte redan skickat oss vidare
              // (Servern borde sköta detta via allPlayersVoted, men detta är en säkerhet)
            }
          }
        }, 1000);
      });
    },

    toggleNav() {
      this.hideNav = !this.hideNav;
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

.blackcard-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 25rem; /* kortets faktiska bredd */
  max-width: 80%; /* responsiv max-bredd */
  margin: 2rem auto; /* centrera */
}
.timer {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin-top: 20px;
}
</style>
