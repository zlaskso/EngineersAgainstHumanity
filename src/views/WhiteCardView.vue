<template>
  <h1>
    {{ uiLabels.cardView?.pickFavourite }}
  </h1>
  <div class="card-view">
    <WhiteCard
      v-for="(i, idx) in currentHandIndexes"
      :key="i"
      :index="idx"
      :prompt="uiCardLabels.whiteCards[i]"
      :selected="selectedIndex === idx"
      :disabled="hasSubmitted"
      @select="setSelected"
    />
  </div>

  <div class="action-area">
    <button
      class="default-btn"
      v-if="!hasSubmitted"
      @click="submitSelection"
      :disabled="selectedIndex === null"
    >
      {{ uiLabels.cardView?.submitAnswer }}
    </button>
    <div v-else class="waiting-msg">
      <h3>{{ uiLabels.cardView?.waitingForOthers }}</h3>
    </div>
  </div>

  <button
    class="rerollButton"
    @click="reroll"
    :disabled="this.rerollsLeft <= 0"
    v-if="!hasSubmitted"
  >
    {{ uiLabels.cardView?.reroll }} ({{ rerollsLeft }} {{ uiLabels.cardView?.left }})
  </button>
</template>
<script>
import WhiteCard from "@/components/WhiteCard.vue";
import ResponsiveNav from "@/components/ResponsiveNav.vue";
import io from "socket.io-client";
const socket = io();

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

    socket.on("newRoundStarted", () => {
      this.hasSubmitted = false;
      this.selectedIndex = null;
      socket.emit("requestCurrentHand", {
        gameID: this.gameID,
        playerID: this.localPlayerID,
      });
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

    socket.on("forceFinalSelection", () => {
      if (this.hasSubmitted) {
        console.log("Card already submitted, ignoring timer force.");
        return; // Avbryt, vi behöver inte skicka igen
      }
      // If no card is selected, default to marked card or the first card (index 0)
      const indexToSubmit = this.selectedIndex !== null ? this.selectedIndex : 0;
      const selectedCard = this.currentHandIndexes[indexToSubmit];

      socket.emit("submitCard", {
        gameID: this.gameID,
        playerID: this.localPlayerID,
        cardIndex: selectedCard,
      });
      this.hasSubmitted = true;
    });

    // ready move to vote view
    socket.on("votingPhaseStarted", () => {
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
          submittingPlayerID: this.localPlayerID,
          cardIndex: selectedCard,
        });

        this.hasSubmitted = true;
      }
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
      if (this.hasSubmitted) return;
      this.selectedIndex = index;
    },
  },
};
</script>

<style scoped>
h1 {
  text-align: center;
  margin-top: 100px;
  margin-bottom: 0px;
}
.card-view {
  display: grid;
  transform: scale(0.7);
  margin-top: -50px;
  margin-bottom: -100px;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  justify-content: center;
}

.rerollButton {
  background: white;
  color: black;
  font-weight: bold;
  padding: 0.75rem 1.5rem;
  border: 2px solid black;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  font-size: 1rem;
  margin-bottom: 50px;
  margin-top: 10px;
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

.default-btn {
  margin-top: 20px;
}

@media (min-width: 900px) {
  .default-btn {
    margin-top: 0px;
  }

  .card-view {
    padding: 2rem;
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    transform: scale(1);
    margin-top: 0px;
    margin-bottom: 0px;
  }

  h1 {
    text-align: center;
    margin-top: 50px;
    margin-bottom: 1.5rem;
  }
}
</style>
