<template>
  <div class="lang-switch" v-on:click="switchLanguage">
    <span v-if="lang === 'sv'">🇸🇪</span>
    <span v-else>🇬🇧</span>
  </div>
  <section id="gameRules">
    <h1>Set Game Rules</h1>
    <div id="maxNumPlayers">
      <label>Max player amount:</label>
      {{ maxPlayerAmount }}
      <div class="gameRuleButtonsContainer">
        <button class="gameRuleButton" @click="addOne('maxPlayerAmount')">↑</button>
        <button class="gameRuleButton" @click="removeOne('maxPlayerAmount')">↓</button>
      </div>
    </div>
    <div id="numRounds">
      <label>Number of rounds:</label>
      {{ numOfRounds }}
      <div class="gameRuleButtonsContainer">
        <button class="gameRuleButton" @click="addOne('numOfRounds')">↑</button>
        <button class="gameRuleButton" @click="removeOne('numOfRounds')">↓</button>
      </div>
    </div>
    <div id="cardsOnHand">
      <label>Cards on hand:</label>
      {{ cardsOnHand }}
      <div class="gameRuleButtonsContainer">
        <button class="gameRuleButton" @click="addOne('cardsOnHand')">↑</button>
        <button class="gameRuleButton" @click="removeOne('cardsOnHand')">↓</button>
      </div>
    </div>
  </section>

  <div class="lobby-name">
    <label for="lobby-name">{{ uiLabels.lobbyName }}</label>
    <input
      type="text"
      id="lobbyName"
      v-model="lobbyName"
      placeholder="Enter lobby name"
    />
  </div>
  <div>
    <button class="openRoomButton" @click="openRoom">Open room</button>
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
  data: function () {
    return {
      lobbyName: "",
      uiLabels: {},
      lang: localStorage.getItem("lang") || "en",
      hideNav: true,
      gameID: null,
      maxPlayerAmount: 0,
      numOfRounds: 0,
      cardsOnHand: 0,
    };
  },
  created: function () {
    this.socket = io("http://localhost:3000", { autoConnect: true });
    this.socket.on("connect_error", (err) => console.error("socket err", err));
    this.socket.on("uiLabels", (labels) => (this.uiLabels = labels));
    this.socket.emit("getUILabels", this.lang);
    this.gameID = this.getGameID();
  },
  methods: {
    switchLanguage: function () {
      if (this.lang === "en") {
        this.lang = "sv";
      } else {
        this.lang = "en";
      }
      localStorage.setItem("lang", this.lang);
      socket.emit("getUILabels", this.lang);
    },
    toggleNav: function () {
      this.hideNav = !this.hideNav;
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
    openRoom() {
      const gameSettings = {
        lobbyName: this.lobbyName,
        maxPlayerAmount: this.maxPlayerAmount,
        numOfRounds: this.numOfRounds,
        cardsOnHand: this.cardsOnHand,
      };
      this.socket.emit("createGameRoom", {
        gameID: this.gameID,
        gameSettings: gameSettings,
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
.lang-switch {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 3rem;
  cursor: pointer;
  display: flex;
  user-select: none;
  user-select: none;
  -webkit-user-select: none;
}
.lang-switch:active {
  transform: scale(0.9);
}
.openRoomButton {
  margin: 3rem 0;
  background: none;
  border: none;
  color: black;
  cursor: pointer;
  font-size: 18px;
  transition-duration: 1.4s;
}
.openRoomButton:hover {
  color: gray;
  transform: scale(1.5);
}
.gameRuleButton {
  display: flex;
  font-weight: bold;
  flex-direction: column;
  background: none;
  border: none;
  color: black;
  font-size: 1.4rem;
  padding: 10px 20px;
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
</style>
