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
  </div>

<div class="action-area">
  <button 
    class="submit-btn" 
    v-if="!hasSubmitted" 
    @click="submitSelection" 
    :disabled="selectedIndex === null">
    {{ uiLabels.cardView?.submitAnswer}}
  </button>
  <div v-else class="waiting-msg">
    <h3>{{ uiLabels.cardView?.waitingForOthers}}</h3>
  </div>
</div>


  <button class="rerollButton" @click="reroll" :disabled="this.rerollsLeft <= 0">
    {{ uiLabels.cardView?.reroll }} ({{ rerollsLeft }} {{ uiLabels.cardView?.left }})
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
      gameID: "inactive poll",
      localPlayerID: sessionStorage.getItem("playerID"),
      ResponsiveNav,
      rerollsLeft: 0,
      currentHandIndexes: [],
      hasSubmitted: false,
      selectedIndex: null,
      gameSettings: {
        lobbyName: "",
        numOfRounds: 0,
        cardsOnHand: 0,
        answerTime: 0,
        nrOfRerolls: 0,
      },
    };
  },
  props: {
    uiLabels: Object,
    uiCardLabels: Object,
  },
  mounted() {},
  created: function () {
    this.gameID = this.$route.params.id;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("join", this.gameID); // obligatoriskt för att ansluta till spelet
      socket.emit("requestCurrentHand", {
        gameID: this.gameID,
        playerID: this.localPlayerID,
      });
    });

    socket.on("currentHand", (data) => {
      if (data.handIndexes) {
        this.currentHandIndexes = data.handIndexes;
        this.rerollsLeft = data.rerollsLeft;
      }
    });

    socket.on("rerollResult", (data) => {
      if (data.newCardIndexes) {
        console.log(this.localPlayerID, "recieved rerolled hand", data.newCardIndexes);
        this.currentHandIndexes = data.newCardIndexes;
        this.rerollsLeft -= 1;
      } else {
        console.error("Kunde inte hämta ny hand efter reroll.");
      }
    });

    socket.on("requestFinalSelection", () => {
      // If no card is selected, default to the first card (index 0) or handle as null
      const indexToSubmit = this.selectedIndex !== null ? this.selectedIndex : 0;
      const selectedCard = this.currentHandIndexes[indexToSubmit];

      socket.emit("submitCard", {
        gameID: this.gameID,
        playerID: this.localPlayerID,
        cardIndex: selectedCard,
      });
    });

    // The server says "Everyone is ready, move to the vote screen."
    socket.on("goToVoteView", () => {
      this.$router.push(`/vote/${this.gameID}`);
    });
    socket.on("requestFinalSelection", () => {
      // If no card is selected, default to the first card (index 0) or handle as null
      const indexToSubmit = this.selectedIndex !== null ? this.selectedIndex : 0;
      const selectedCard = this.currentHandIndexes[indexToSubmit];

      socket.emit("submitCard", {
        gameID: this.gameID,
        playerID: this.localPlayerID,
        cardIndex: selectedCard,
      });
    });

    // The server says "Everyone is ready, move to the vote screen."
    socket.on("goToVoteView", () => {
      this.$router.push(`/vote/${this.gameID}`);
    });
  },

  methods: {
    reroll() {
      // Ändra logiken till att begära reroll från servern
      console.log("Requesting reroll from server...", this.localPlayerID);
      if (this.rerollsLeft > 0) {
        socket.emit("requestReroll", {
          gameID: this.gameID,
          playerID: this.localPlayerID,
        });
        this.selectedIndex = null;

      
      }
      
    },

    submitSelection() {
    if (this.selectedIndex !== null) {
      const selectedCard = this.currentHandIndexes[this.selectedIndex];
      
      socket.emit("submitCard", {
        gameID: this.gameID,
        playerID: this.localPlayerID,
        cardIndex: selectedCard
      });
      
      this.hasSubmitted = true;
    }
  },

    fetchLobbyData: function (gameID) {
      socket.emit("getGameSettings", gameID);
    },

    requestInitialHand() {
      if (this.gameID && this.localPlayerID) {
        socket.emit("requestInitialHand", {
          gameID: this.gameID,
          playerID: this.localPlayerID,
        });
      }
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

.submit-btn {
  margin: 1.5rem;
  color:  black;
  font-weight: bold;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  font-size: 1rem;
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


.footer-actions {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  padding-bottom: 2rem;
}

.vote-btn {
  background-color: black;
  color: white;
  padding: 15px 30px;
  font-size: 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.vote-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.card-view {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

</style>
