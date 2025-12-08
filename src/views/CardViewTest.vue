<template>
  <h1>
    {{ uiLabels.cardView?.pickFavourite }} {{ currentHandIndexes }}{{ roundUsedIndexes }}
  </h1>
  <div class="card-view">
    <WhiteCard
      v-for="i in currentHandIndexes"
      :key="i"
      :prompt="uiCardLabels.whiteCards[i]"
    />
    <BlackCard :prompt="'test kort'" />
  </div>

  <button class="rerollButton" @click="reroll" :disabled="nrOfRerolls <= 0">
    {{ uiLabels.cardView?.reroll }} ({{ nrOfRerolls }} {{ uiLabels.cardView?.left }})
  </button>
</template>
<script>
import WhiteCard from "@/components/WhiteCard.vue";
import BlackCard from "@/components/blackCard.vue";
import ResponsiveNav from "@/components/ResponsiveNav.vue";
import io from "socket.io-client";
const socket = io("localhost:3000");

export default {
  name: "CardView",
  components: {
    ResponsiveNav,
    WhiteCard,
    BlackCard,
  },
  data: function () {
    return {
      ResponsiveNav,
      nrOfWhiteCardsOnHand: 7,
      currentHandIndexes: [],
      roundUsedIndexes: [],
      nrOfRerolls: 10,
    };
  },
  props: {
    uiLabels: Object,
    //  prompt: Object,
    uiCardLabels: Object,
  },
  mounted() {
    //if (this.uiCardLabels?.whiteCards?.length) {
    this.generateHand();
    //}
  },
  /* 
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
*/
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
          //this.roundUsedIndexes.push(randomIndex);
        }
        if (
          this.roundUsedIndexes.length + this.currentHandIndexes.length - 2 >=
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
.rerollButton {
  background: gray;
  color: white;
  font-weight: bold;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  font-size: 1rem;
}

.rerollButton:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.rerollButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #ccc;
  box-shadow: none;
}
</style>
