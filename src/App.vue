<script>
import { RouterView } from "vue-router";
import LanguageComponent from "./components/LanguageComponent.vue";
import io from "socket.io-client";

const socket = io();

export default {
  name: "App",
  components: {
    LanguageComponent,
  },
  data: function () {
    return {
      lobbyRoutes: ["LobbyView", "ResultView"],
      gameRoutes: ["BlackCardView", "FinalView"],

      lang: localStorage.getItem("lang") || "en",
      uiLabels: {},
      uiCardLabels: {},
    };
  },
  created: function () {
    socket.on("uiLabels", (l) => this.uiLabels = l);
    socket.on("uiCardLabels", (l) => this.uiCardLabels = l);
    
    const fetchAllLabels = () => {
      socket.emit("getUILabels", this.lang);
      socket.emit("getUICardLabels", this.lang);
    };

    if (socket.connected) fetchAllLabels();
    socket.on("connect", fetchAllLabels);
  },

  watch: {
    $route(to) {
      this.checkMusic(to.name);
    }
  },

  methods: {
    amIHost() {
      return sessionStorage.getItem("hostPlayerID") !== null;
    },

    checkMusic(routeName) {
      const lobbyAudio = this.$refs.lobbyMusic;
      const gameAudio = this.$refs.gameMusic;

      if (!lobbyAudio || !gameAudio) return;

      if (!this.amIHost()) {
        lobbyAudio.pause();
        gameAudio.pause();
        return; 
      }

      
      if (this.lobbyRoutes.includes(routeName)) {
        if (lobbyAudio.paused) {
          gameAudio.pause();
          this.playAudio(lobbyAudio);
        }
      } 
      else if (this.gameRoutes.includes(routeName)) {
        if (gameAudio.paused) {
          lobbyAudio.pause();
          this.playAudio(gameAudio);
        }
      }
    },

    playAudio(audioElement) {
      audioElement.volume = 0.3;
      
      const playPromise = audioElement.play();

      if (playPromise !== undefined) {
        playPromise.catch(() => {
          console.log("Autoplay blockad. Väntar på klick...");
          document.addEventListener("click", () => {
            if (this.amIHost()) audioElement.play();
          }, { once: true });
        });
      }
    },

    switchLanguage: function () {
      if (this.lang === "en") this.lang = "sv";
      else this.lang = "en";
      localStorage.setItem("lang", this.lang);
      socket.emit("getUILabels", this.lang);
      socket.emit("getUICardLabels", this.lang);
    },
  },
};
</script>

<template>
  <audio ref="lobbyMusic" loop preload="auto">
    <source src="/music/lobby-music.mp3" type="audio/mpeg">
  </audio>

  <audio ref="gameMusic" loop preload="auto">
    <source src="/music/game-music.mp3" type="audio/mpeg">
  </audio>

  <LanguageComponent v-bind:lang="lang" v-on:switch-language="switchLanguage" />
  <RouterView v-bind:uiLabels="uiLabels" :uiCardLabels="uiCardLabels" :lang="lang"/>
</template>

<style></style>