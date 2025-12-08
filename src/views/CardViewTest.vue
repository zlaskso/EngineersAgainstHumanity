<template>
  <div class="card-view">
    <h1>Card View {{ uiCardsLabels }}</h1>
    <WhiteCard 
      v-for="i in whiteCardsOnHand" 
      :key="i" 
      :prompt="getRandomWhiteCard()"
    />
  </div>
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
        whiteCardsOnHand: 3,
        ResponsiveNav,
    };
  },
  props: {
  uiLabels: Object,
  //  prompt: Object,
  uiCardsLabels: Object
  },
  methods: {
    getRandomWhiteCard() {
      if (!this.uiCardsLabels) return 'FUNKAR EJ';
      const cards = this.uiCardsLabels.whiteCards;
      const randomIndex = Math.floor(Math.random() * cards.length);
      return cards[randomIndex];
    },
        toggleNav: function () {
      this.hideNav = !this.hideNav;
    }
  }
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
