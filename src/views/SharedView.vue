
<template>
    <div class ="shared-view">
    <h1> testing testing, men sen helt utan rubrik </h1>
    <div class="card-view">
     <BlackCard
      :prompt="uiCardLabels.blackCards[1]"></BlackCard>
  </div>
  </div>
</template>


<script>
import BlackCard from "@/components/blackCard.vue";
import ResponsiveNav from "@/components/ResponsiveNav.vue";
import io from "socket.io-client";
const socket = io("localhost:3000");

export default {
  name: "CardView",
  components: {
    ResponsiveNav,
    BlackCard,
  },
  data: function () {
    return {
      currentHandIndexes: [],
      roundUsedIndexes: [],
    };
  },
  props: {
    uiLabels: Object,
    uiCardLabels: Object,
  },
  mounted() {
    if (this.uiCardLabels?.blackCards?.length) {
      this.generateHand();
    }
  },

   methods: {
    generateHand() {
      const totalCards = this.uiCardLabels?.blackCards;
      if (!Array.isArray(totalCards) || totalCards.length === 0) {
        // borde inte hända med mounted?
        console.log("OPSIE");
      }
      this.currentBlackIndexes = [];
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
    setSelected(index) {
      this.selectedIndex = index;
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