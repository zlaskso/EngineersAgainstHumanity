<template>
  <div class="vote-container">
    <div class="header-section">
      <h1>{{ uiLabels.voteView?.header }}</h1>
    </div>

    <div class="card-view">
      <div
        v-for="(cardData, index) in cardsToVoteOn"
        :key="index"
        class="vote-card-wrapper"
        :class="{ 'selected-vote': selectedVoteIndex === cardData.cardIndex }"
        @click="selectVote(cardData.cardIndex)"
      >
        <WhiteCard
          v-if="uiCardLabels?.whiteCards"
          :prompt="uiCardLabels.whiteCards[cardData.cardIndex]"
          :selected="selectedVoteIndex === cardData.cardIndex"
        />
      </div>
    </div>

    <div class="footer-actions">
      <button
        v-if="!hasVoted"
        class="default-btn"
        @click="submitVote"
        :disabled="selectedVoteIndex === null"
      >
        {{ uiLabels.voteView?.vote }}
      </button>

      <div v-else class="waiting-message">
        <h3>{{ uiLabels.voteView?.voteReceived }}</h3>
      </div>
    </div>
  </div>
</template>

<script>
import WhiteCard from "@/components/WhiteCard.vue";
import BlackCard from "@/components/blackCard.vue";
import ResponsiveNav from "@/components/ResponsiveNav.vue";
import io from "socket.io-client";
const socket = io();

export default {
  name: "VoteView",
  components: {
    ResponsiveNav,
    WhiteCard,
    BlackCard,
  },

  data: function () {
    return {
      gameID: "inactive poll",
      localPlayerID: sessionStorage.getItem("playerID"),
      cardsToVoteOn: [],
      selectedVoteIndex: null,
      hasVoted: false,
      ResponsiveNav,
      chosenIndexes: [],
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

  computed: {},

  props: {
    uiLabels: Object,
    uiCardLabels: Object,
  },

  mounted: function () {},
  created: function () {
    this.gameID = this.$route.params.id;
    socket.emit("join", this.gameID);

    socket.emit("requestCardsToVoteOn", {
      gameID: this.gameID,
      playerID: this.localPlayerID,
    });

    socket.on("cardsToVoteOn", (data) => {
      // röstbara kort
      this.cardsToVoteOn = data.submissions;
    });

    socket.on("roundFinished", () => {
      this.$router.push("/result/" + this.gameID);
    });
  },

  methods: {
    selectVote(index) {
      if (!this.hasVoted) {
        this.selectedVoteIndex = index;
      }
    },

    submitVote() {
      // kolla att det finns val
      if (this.selectedVoteIndex !== null) {
        socket.emit("submitVote", {
          gameID: this.gameID,
          voteCardIndex: this.selectedVoteIndex,
          votingPlayerID: this.localPlayerID,
        });

        this.hasVoted = true;
      }
    },
    fetchLobbyData: function (gameID) {
      socket.emit("getGameSettings", gameID);
    },

    setSelected(index) {
      this.selectedIndex = index;
    },
  },
};
</script>

<style scoped>
.vote-container {
  padding: 20px;
  text-align: center;
}
.card-view {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  margin-bottom: 80px;
}
.vote-card-wrapper {
  transition: transform 0.2s;
}
.selected-vote {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}
.footer-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: white;
  padding-top: 20px;
  padding-bottom: 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.card-view {
  padding: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

@media (max-width: 900px) {
  h1 {
    text-align: center;
    margin-top: 50px;
    margin-bottom: 1.5rem;
  }

  .card-view {
    display: grid;
    transform: scale(0.7);
    margin-top: -50px;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    justify-content: center;
  }
}
</style>
