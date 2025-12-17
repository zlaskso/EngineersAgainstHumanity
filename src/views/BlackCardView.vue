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
      gameBlackUsedIndex: [],
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
      handler(newVal) {
        if (newVal?.blackCards?.length && this.currentBlackIndex === null) {
          this.currentBlackIndex = this.getRandomBlackCard();
        }
      },
    },
  },
  mounted() {
    console.log("Mounted blackcard körs!");
    this.startTimer();
  },
  created: function () {
    this.gameID = this.$route.params.id;
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
          }

          else if (this.timeLeft <= 0 && this.isFirstRestart === false) {
            console.log("Phase 2 Over: Moving everyone to Results");
            clearInterval(interval);
            this.goToNextPage();
          }
        }, 1000);
      });
    },
    getRandomBlackCard() {
      const cards = this.uiCardLabels?.blackCards;
      if (!Array.isArray(cards) || cards.length === 0) {
        console.warn("Black cards not loaded yet");
        return null;
      }

      let randomIndex = Math.floor(Math.random() * cards.length);

      // försäkra att vi inte får samma kort
      if (this.gameBlackUsedIndex.includes(randomIndex)) {
        randomIndex = Math.floor(Math.random() * cards.length);
      }

      this.gameBlackUsedIndex.push(randomIndex);
      return randomIndex;
    },

    toggleNav: function () {
      this.hideNav = !this.hideNav;
    },

    goToNextPage() {
      this.$router.push(`/result/${this.gameID}`); //nästa sida WHITE CARDS
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
  size: 2rem;
}
.timer {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin-top: 20px;
}
</style>
