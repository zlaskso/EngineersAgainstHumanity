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

    startTimer() {
      this.timeLeft = 10;

      const interval = setInterval(() => {
        this.timeLeft--;
        //this.$forceUpdate();

        if (this.timeLeft <= 0) {
          clearInterval(interval);
          this.goToNextPage(); // byt sida
        }
      }, 1000);
    },

    goToNextPage() {
      this.$router.push("/cards/:id"); //nästa sida WHITE CARDS
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
