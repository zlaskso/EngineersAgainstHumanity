<template>
  <div class="card-view">
    <h1>Card View {{ uiCardLabels.whiteCards }}{{ currentHandIndexes }}</h1>
    <WhiteCard
      v-for="i in currentHandIndexes"
      :key="i"
      :prompt="uiCardLabels.whiteCards[i]"
    />
  </div>

  <button class="rerollButton" @click="reroll" :disabled="nrOfRerolls <= 0">
    Reroll ({{ nrOfRerolls }} kvar)
  </button>
</template>
<script>
import WhiteCard from "@/components/WhiteCard.vue";
import ResponsiveNav from "@/components/ResponsiveNav.vue";
import io from "socket.io-client";
const socket = io("localhost:3000");

export default {
  name: "CardView",
  components: {
    ResponsiveNav,
    WhiteCard,
  },
  data: function () {
    return {
      ResponsiveNav,
      nrOfWhiteCardsOnHand: 4,
      currentHandIndexes: [],
      roundUsedIndexes: [],
      nrOfRerolls: 2,
    };
  },
  props: {
    uiLabels: Object,
    //  prompt: Object,
    uiCardLabels: Object,
  },

  watch: {
    // Kör generateHand när whiteCards laddats
    uiCardLabels: {
      deep: true,
      immediate: true,
      handler(newVal) {
        if (newVal?.whiteCards?.length) {
          this.generateHand();
        }
      },
    },
  },

  methods: {
    generateHand() {
      const totalCards = this.uiCardLabels?.whiteCards;
      if (!Array.isArray(totalCards) || totalCards.length === 0) {
        // borde inte hända med mounted?
        console.log("OPSIE");
      }
      this.currentHandIndexes = [];

      //const totalCards = this.uiCardLabels.whiteCards;
      while (this.currentHandIndexes.length < this.nrOfWhiteCardsOnHand) {
        const randomIndex = Math.floor(Math.random() * totalCards.length);
        if (
          !this.currentHandIndexes.includes(randomIndex) &&
          !this.roundUsedIndexes.includes(randomIndex)
        ) {
          this.currentHandIndexes.push(randomIndex);
        }
        if (
          this.roundUsedIndexes.length + this.currentHandIndexes.length >=
          totalCards.length
        )
          break;
      }
    },
    getRandomWhiteCard() {
      if (!this.uiCardLabels || !this.uiCardLabels.whiteCards) {
        return "FUNKAR EJ";
      }
      const cards = this.uiCardLabels.whiteCards;
      const randomIndex = Math.floor(Math.random() * cards.length);
      this.whiteHand.push(cards[randomIndex]);
      return cards[randomIndex];
    },

    reroll() {
      if (this.nrOfRerolls > 0) {
        this.nrOfRerolls--;
        this.generateHand();
      }
    },

    toggleNav: function () {
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
</style>
