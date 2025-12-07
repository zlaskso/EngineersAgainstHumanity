<script>
import { RouterView } from 'vue-router'
import LanguageComponent from './components/LanguageComponent.vue';
import io from 'socket.io-client';
const socket = io("localhost:3000");

export default {
  name: 'App',
  components: {
    LanguageComponent
  },
  data: function() {
    return {
    lang: localStorage.getItem("lang") || "en",
    uiLabels: {}
    }
  },
  created: function () {
    socket.on("uiLabels", (labels) => {
      this.uiLabels = labels;
    });
    if (socket.connected) {
      socket.emit("getUILabels", this.lang);
    }

    socket.on("connect", () => {
      socket.emit("getUILabels", this.lang); 
    });
  },
  methods: {
    switchLanguage: function() {
      if (this.lang === "en") {
        this.lang = "sv"
      }
      else {
        this.lang = "en";
      }
      localStorage.setItem("lang", this.lang);
      socket.emit("getUILabels", this.lang);
    }
    }
  };
</script>

<template>
  <LanguageComponent
    v-bind:lang="lang" 
    v-on:switch-language="switchLanguage"
  />

  <RouterView v-bind:uiLabels="uiLabels" />
</template>

<style>

</style>
