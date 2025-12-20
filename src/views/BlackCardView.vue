<template>
  <div class="shared-view">
    <h1>testing testing, men sen helt utan rubrik</h1>
    <div class="blackcard-wrap">
      <BlackCard
        v-if="uiCardLabels?.blackCards && currentBlackIndex !== null"
        :prompt="uiCardLabels.blackCards[currentBlackIndex]"
      ></BlackCard>
    </div>
  </div>
  <div class="timer">{{ timeLeft }} sek kvar</div>
  {{ gameBlackUsedIndex }}
</template>

<script>
import BlackCard from "@/components/BlackCard.vue";
import ResponsiveNav from "@/components/ResponsiveNav.vue";
import io from "socket.io-client";
const socket = io("localhost:3000");

export default {
  name: "BlackCardView",
  components: {
    gameID: "inactive poll",
    ResponsiveNav,
    BlackCard,
  },
  data: function () {
    return {
      currentBlackIndex: null,
      timeLeft: 10,
      isFirstRestart: true,
    };
  },
  props: {
    uiLabels: Object,
    uiCardLabels: Object,
  },
  watch: {
    uiCardLabels: {
      deep: true,
      immediate: true,
    },
  },
  mounted() {
    console.log("Mounted blackcard körs!");
    this.startTimer();
  },
  created: function () {
    this.gameID = this.$route.params.id;
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("join", this.gameID); // obligatoriskt för att ansluta till spelet
      socket.emit("requestCurrentBlackCard", {
        gameID: this.gameID,
      });
    });

    socket.on("currentBlackCard", (data) => {
      if (data.blackCard !== undefined) {
        this.currentBlackIndex = data.blackCard;
      }
    });
  },

  methods: {
    async startTimer() {
      // 1. Fetch settings once to get the duration
      socket.emit("getGameSettings", { gameID: this.gameID });

      socket.once("gameSettings", (d) => {
        const duration = d.gameSettings.answerTime || 20; // fallback to 20s
        this.timeLeft = duration;

        const interval = setInterval(() => {
          this.timeLeft--;

          if (this.timeLeft < 0 && this.isFirstRestart === true) {
            console.log("Phase 1 Over: Moving players to VoteView");
            this.isFirstRestart = false;
            this.timeLeft = duration;
            socket.emit("startVotePhase", this.gameID);
          } else if (this.timeLeft <= 0 && this.isFirstRestart === false) {
            console.log("Phase 2 Over: Moving everyone to Results");
            clearInterval(interval);
            this.goToNextPage();
          }
        }, 1000);
      });
    },
    toggleNav: function () {
      this.hideNav = !this.hideNav;
    },

    goToNextPage() {
      this.$router.push(`/result/${this.gameID}`);
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
