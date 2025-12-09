<template>
  <section id="gameRules">
    <h1>{{ uiLabels.createView?.setGameRules }}</h1>
    <div id="maxNumPlayers">
      <label>{{ uiLabels.createView?.maxNumPlayers }}</label>
      {{ maxPlayerAmount }}

      <div class="gameRuleButtonsContainer">
        <button class="gameRuleButton" @click="addOne('maxPlayerAmount')">↑</button>
        <button class="gameRuleButton" @click="removeOne('maxPlayerAmount')">↓</button>
      </div>
    </div>

    <div id="numRounds">
      <label>{{ uiLabels.createView?.numOfRounds }}</label>
      {{ numOfRounds }}
      <div class="gameRuleButtonsContainer">
        <button class="gameRuleButton" @click="addOne('numOfRounds')">↑</button>
        <button class="gameRuleButton" @click="removeOne('numOfRounds')">↓</button>
      </div>
    </div>

    <div id="cardsOnHand">
      <label>{{ uiLabels.createView?.cardsOnHand }}</label>
      {{ cardsOnHand }}
      <div class="gameRuleButtonsContainer">
        <button class="gameRuleButton" @click="addOne('cardsOnHand')">↑</button>
        <button class="gameRuleButton" @click="removeOne('cardsOnHand')">↓</button>
      </div>
    </div>

    <div id="answerTime">
      <label>{{ uiLabels.createView?.answerTime }}</label>
      {{ answerTime }}
      <div class="gameRuleButtonsContainer">
        <button class="gameRuleButton" @click="addFifteen('answerTime')">↑</button>
        <button class="gameRuleButton" @click="removeFifteen('answerTime')">↓</button>
      </div>
    </div>

    <div id="nrOfRerolls">
      <label>{{ uiLabels.createView?.nrOfRerolls }}</label>
      {{ nrOfRerolls }}
      <div class="gameRuleButtonsContainer">
        <button class="gameRuleButton" @click="addOne('nrOfRerolls')">↑</button>
        <button class="gameRuleButton" @click="removeOne('nrOfRerolls')">↓</button>
      </div>
    </div>
  </section>

  <div class="lobby-name">
    <input
      type="text"
      id="lobbyName"
      v-model="lobbyName"
      v-bind:placeholder="uiLabels.createView?.lobbyNamePlaceholder"
      required
    />
  </div>

  <div class="lobby-actions">
    <button class="back-button-aligned" @click="goBack">{{ uiLabels.createView?.back }}</button>
    <button class="openLobbyButton" @click="openLobby">
      {{ uiLabels.createView?.openLobby }}
    </button>
  </div>
</template>

<script>
import ResponsiveNav from "@/components/ResponsiveNav.vue";
import io from "socket.io-client";
const socket = io("localhost:3000");

export default {
  name: "CreateRulesView",
  components: {
    ResponsiveNav,
  },

  props: {
    uiLabels: Object,
  },

  data: function () {
    return {
      lobbyName: "",
      hideNav: true,
      gameID: null,
      maxPlayerAmount: 0,
      numOfRounds: 0,
      cardsOnHand: 0,
      answerTime: 0,
      nrOfRerolls: 0,
    };
  },
  created: function () {
    // socket = io("http://localhost:3000", { autoConnect: true });
    socket.on("connect_error", (err) => console.error("socket err", err));
    this.gameID = this.getGameID();
  },
  methods: {
    toggleNav: function () {
      this.hideNav = !this.hideNav;
    },

    goBack: function () {
      this.$router.go(-1);
    },

    getGameID: function () {
      return Math.floor(Math.random() * 100000);
    },
    addOne(gameRulesField) {
      this[gameRulesField]++;
    },
    removeOne(gameRulesField) {
      if (this[gameRulesField] > 0) {
        this[gameRulesField]--;
      }
    },
    addFifteen(gameRulesField) {
      this[gameRulesField] += 15;
    },
    removeFifteen(gameRulesField) {
      if (this[gameRulesField] > 0) {
        this[gameRulesField] -= 15;
      }
    },
    openLobby() {
      if (!this.lobbyName || this.lobbyName.trim() === "") {
        alert("Please enter a lobby name!");
        return;
      }
      const gameSettings = {
        lobbyName: this.lobbyName,
        maxPlayerAmount: this.maxPlayerAmount,
        numOfRounds: this.numOfRounds,
        cardsOnHand: this.cardsOnHand,
        answerTime: this.answerTime,
        nrOfRerolls: this.nrOfRerolls,
      };

      const participants = [];

      socket.emit("createGameRoom", {
        gameID: this.gameID,
        gameSettings: gameSettings,
        participants: participants,
      });
      this.$router.push(`/lobby/${this.gameID}`);
    },
  },
};
</script>

<style scoped>
body {
  font-family: "Helvetica Neue", Arial, sans-serif;
  font-size: large;
}
h1 {
  font-family: "Helvetica Neue";
  font-size: 2rem;
}
.gameID {
  display: flex;
  font-size: 1.5rem;
  margin: 1rem 0;
}

#gameRules {
  font-family: "Helvetica Neue", Arial, sans-serif;
  display: flex;
  flex-direction: column;
  font-size: 4rem;
  gap: 1rem;
  margin: 2rem 0;
}

.openLobbyButton {
  position: absolute;
  right: 40;
  background: none;
  border: none;
  color: gray;
  cursor: pointer;
  font-size: 2rem;
  transition-duration: 1.4s;
}
.openLobbyButton:hover {
  color: black;
  transform: scale(1.4);
}

.back-button-aligned {
  position: absolute;
  left: 0;
  background: none;
  border: none;
  color: gray;
  cursor: pointer;
  font-size: 2rem;
  transition-duration: 1.4s;
}

.back-button-aligned:hover {
  color: black;
  transform: scale(1.15);
}

.gameRuleButton {
  display: flex;
  font-weight: bold;
  flex-direction: column;
  background: none;
  border: none;
  color: black;
  font-size: 0.9rem;
  padding: 5px 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}
.gameRuleButton:hover {
  transform: scale(1.6);
}
.gameRuleButtonsContainer {
  display: inline-block;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}
input[type="text"] {
  margin: 20px;
  padding: 10px;
  height: 50px;
  width: 350px;
  font-size: 20pt;
  border-radius: 10px;
  outline: none;
  border: 2px solid gray;
}
input[type="text"] {
  border-color: black;
  border-radius: 10px;
  outline: none;
}

.lobby-actions {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 3rem;
}
</style>
