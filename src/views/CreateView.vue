<template>
  <div>
    <div class="create">
      <h1>{{ uiLabels.createGame }}</h1>
      <div class="lobby-name">
        <label for="lobby-name">{{ uiLabels.lobbyName }}:</label>
        <input type="text" id="lobby-name" v-model="lobbyName" placeholder="Enter lobby name" />
      </div>
    </div>

    <div class="lang-switch" v-on:click="switchLanguage">
      <span v-if="lang === 'sv'">🇸🇪</span>
      <span v-else>🇬🇧</span>
    </div>
  </div>
</template>

<script>    
import ResponsiveNav from '@/components/ResponsiveNav.vue';
import io from 'socket.io-client';
const socket = io("localhost:3000");

export default {
  name: 'CreateView',
  components: {
    ResponsiveNav
  },
  data: function () {
    return {
      lobbyName: '',
      uiLabels: {},
      newPollId: "",
      lang: localStorage.getItem( "lang") || "en",
      hideNav: true,
      gameID: null
    }
  },
  created: function () {
    this.socket = io("http://localhost:3000", { autoConnect: true });
    this.socket.on("connect_error", err => console.error("socket err", err));
    this.socket.on( "uiLabels", labels => this.uiLabels = labels );
    this.socket.emit( "getUILabels", this.lang );
    this.gameID = this.getGameID();
  },
  methods: {
    switchLanguage: function() {
      if (this.lang === "en") {
        this.lang = "sv"
      }
      else {
        this.lang = "en"
      }
      localStorage.setItem( "lang", this.lang );
      socket.emit( "getUILabels", this.lang );
    },
    toggleNav: function () {
      this.hideNav = ! this.hideNav;
    },
    
    getGameID: function() {
      return Math.floor(Math.random() * 100000);
    },


  }
}
</script>

<style scoped>

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
</style>