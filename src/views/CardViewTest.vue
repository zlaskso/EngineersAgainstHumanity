<template>
  <h1>
    {{ uiLabels.cardView?.pickFavourite }} {{ currentHandIndexes }}{{ roundUsedIndexes }}
  </h1>
  <div class="card-view">
    <WhiteCard
      v-for="(i, idx) in currentHandIndexes"
      :key="i"
      :index="idx"
      :prompt="uiCardLabels.whiteCards[i]"
      :selected="selectedIndex === idx"
      @select="setSelected"
    />
    <!--<BlackCard :prompt="uiCardLabels.blackCards[0]" />-->
  </div>
  {{ gameSettings.nrOfRerolls }} {{ gameSettings.cardsOnHand }}

  <button class="rerollButton" @click="reroll" :disabled="this.nrOfRerolls <= 0">
    {{ uiLabels.cardView?.reroll }} ({{ this.nrOfRerolls }} {{ uiLabels.cardView?.left }})
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
      gameID: "inactive poll",
      localPlayerID: sessionStorage.getItem("playerID"),
      ResponsiveNav,
      //nrOfWhiteCardsOnHand: 7,
      currentHandIndexes: [],
      //roundUsedIndexes: [],
      //nrOfRerolls: 10,
      selectedIndex: null,
      gameSettings: {
        lobbyName: "",
        //maxPlayerAmount: 0,
        numOfRounds: 0,
        cardsOnHand: 0,
        answerTime: 0,
        nrOfRerolls: 0,
      },
    };
  },
  props: {
    uiLabels: Object,
    //  prompt: Object,
    uiCardLabels: Object,
  },
  mounted() {
    /*     if (this.uiCardLabels?.whiteCards?.length) {
      this.requestInitialHand();
    } */
  },
  created: function () {
    this.gameID = this.$route.params.id;
    // this.fetchLobbyData(this.gameID);

    /* 
    socket.on("gameSettings", (room) => {
      if (room && room.gameSettings) {
        this.gameSettings = room.gameSettings;
        this.requestInitialHand();
      } else {
        console.error("Kunde inte hämta spelinställningar trots giltigt ID.");
      }
    }); 
    */
    socket.on("initialHand", (data) => {
      if (data.handIndexes) {
        console.log(this.localPlayerID, "recieved initial hand", data.handIndexes);
        this.currentHandIndexes = data.handIndexes;
        console.log("Initial hand indexes set to:", this.currentHandIndexes);
        // this.gameSettings.nrOfRerolls = data.rerollsLeft;
      } else {
        console.error("Kunde inte hämta initial hand.");
      }
    });

    socket.on("rerollResult", (data) => {
      if (data.newCardIndexes) {
        console.log(this.localPlayerID, "recieved rerolled hand", data.newHandIndexes);
        this.currentHandIndexes = data.newHandIndexes;
        this.nrOfRerolls = data.rerollsLeft;
      } else {
        console.error("Kunde inte hämta ny hand efter reroll.");
      }
    });
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      this.requestInitialHand();
    });
  },

  methods: {
    requestInitialHand() {
      if (this.gameID && this.localPlayerID) {
        socket.emit("requestInitialHand", {
          gameID: this.gameID,
          playerID: this.localPlayerID,
        });
      }
    },

    reroll() {
      // Ändra logiken till att begära reroll från servern
      if (this.gameSettings.nrOfRerolls > 0) {
        socket.emit("requestReroll", {
          gameID: this.gameID,
          playerID: this.localPlayerID,
        });
        this.selectedIndex = null;
      }
    },

    fetchLobbyData: function (gameID) {
      socket.emit("getGameSettings", gameID);
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
