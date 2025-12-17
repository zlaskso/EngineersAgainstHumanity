<template>
  <section id="gameRules">
    <h1>{{ uiLabels.createView?.setGameRules }}</h1>

    <div v-for="rule in rulesConfig" :key="rule.key" class="gameRuleContainer">
      <label>{{ uiLabels.createView?.[rule.label] }}</label>
      <span class="ruleValue">{{ gameRules[rule.key] }}</span>

      <div class="gameRuleButtonsContainer">
        <button class="gameRuleButton" @click="changeRule(rule.key, rule.step)">↑</button>
        <button class="gameRuleButton" @click="changeRule(rule.key, -rule.step)">
          ↓
        </button>
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
    <button class="back-button-aligned" @click="goBack">
      {{ uiLabels.createView?.back }}
    </button>
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
      gameRules: {
        //maxPlayerAmount: 0,
        numOfRounds: 5,
        cardsOnHand: 5,
        answerTime: 30,
        nrOfRerolls: 2,
      },
      rulesConfig: [
        //{ key: "maxPlayerAmount", label: "maxNumPlayers", step: 1 },
        { key: "numOfRounds", label: "numOfRounds", step: 1, min: 1, max: 20 },
        { key: "cardsOnHand", label: "cardsOnHand", step: 1, min: 1, max: 20 },
        { key: "answerTime", label: "answerTime", step: 15, min: 15, max: 300 },
        { key: "nrOfRerolls", label: "nrOfRerolls", step: 1, min: 1, max: 20 },
      ],
    };
  },
  created: function () {
    socket.on("connect_error", (err) => console.error("socket err", err));
  },

  methods: {
    changeRule(key, delta) {
      const rule = this.rulesConfig.find((r) => r.key === key);
      if (!rule) return;

      const newValue = this.gameRules[key] + delta;

      this.gameRules[key] = Math.min(rule.max, Math.max(rule.min, newValue));
    },

    toggleNav: function () {
      this.hideNav = !this.hideNav;
    },

    goBack: function () {
      this.$router.go(-1);
    },

    openLobby() {
      if (!this.lobbyName || this.lobbyName.trim() === "") {
        alert("Please enter a lobby name!");
        return;
      }

      const gameSettings = {
        lobbyName: this.lobbyName,
        ...this.gameRules,
      };

      socket.emit("createGameRoom", {
        gameSettings: gameSettings,
      });

      socket.on("gameRoomCreated", (d) => {
        sessionStorage.setItem("hostPlayerID", d.hostID);
        this.$router.push(`/lobby/${d.gameID}`);
      });
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
  gap: 10rem;
  margin-left: 5;
  margin-bottom: 5rem;
}
</style>
