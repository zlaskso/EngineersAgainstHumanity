<template>
  <header>
    <div v-bind:class="['hamburger', {'close': !hideNav}]" 
         v-on:click="toggleNav">
    </div>
    <button class="logo">
      <img src="/img/logo.png">
      Engineers Against Humanity
    </button>
    <div class="lang-switch" v-on:click="switchLanguage">
      <span v-if="lang === 'sv'">🇬🇧</span>
      <span v-else>🇸🇪</span>
    </div>
  </header>
  <router-link to="/create/">
  <button class="startButton" id="createButton">
    {{uiLabels.createGame}}
  </button>
  </router-link>
  <router-link to="/join/">
  <button class="startButton" id="joinButton">
    {{uiLabels.joinGame}}
  </button>
  </router-link>
  <footer>
    <router-link to="/about/">
    <button id="htp">{{uiLabels.htp}}</button>
    </router-link>
  </footer>
</template>

<script>
import ResponsiveNav from '@/components/ResponsiveNav.vue';
import io from 'socket.io-client';
const socket = io("localhost:3000");

export default {
  name: 'StartView',
  components: {
    ResponsiveNav
  },
  data: function () {
    return {
      uiLabels: {},
      newPollId: "",
      lang: localStorage.getItem( "lang") || "en",
      hideNav: true
    }
  },
  created: function () {
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.emit( "getUILabels", this.lang );
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
    }
  }
}
</script>
<style scoped>
  header {
    width: 100%;
    display: grid;
    /* Uppdaterad grid: 3 kolumner. 
       2em (hamburger) | auto (logo, tar upp all plats) | 5rem (flagga) */
    grid-template-columns: 2em auto 5rem;
    align-items: center;
  }
  .logo {
    letter-spacing: 0.08em;
    font-size: 3rem;
    font-weight: bold;
    padding-top:0.2em;
    border: 0;
    background: transparent;
  }
  .logo img {
    height:2.5rem;
    vertical-align: bottom;
    margin-right: 0.5rem; 
  }
  .hamburger {
    color:white;
    width:1em;
    display: flex;
    align-items: center;
    justify-content: left;
    padding:0.5rem;
    top:0;
    left:0;
    height: 2rem;
    cursor: pointer;
    font-size: 1.5rem;
  }

  @keyframes growAnimation {
    from {scale: 1;}
    to {scale: 1.05;}
  }

  @keyframes grayToBlack {
    from {color:gray}
    to {color: black}
  }

  .startButton {
    border-radius: 15px;
    width: 300px;
    height: 422px;
    margin-top: 100px;
    padding: 40px;
    padding-bottom: 300px;
    font-size: 26pt;
    font-weight: bold;
    cursor: pointer;
    text-align: left;
  }

  #createButton {
    background-color: black;
    color: white;
    border: 2px solid black;
    text-align: left;
    rotate: -10deg;
  }

  #joinButton {
    background-color: white;
    color: black;
    border: 2px solid black;
    rotate: 10deg;
  }

  .startButton:hover {
    animation-name: growAnimation;
    animation-duration: 0.5s;
    animation-fill-mode: forwards;
  }

  #htp:hover {
    animation-name: grayToBlack;
    animation-duration: 0.5s;
    animation-fill-mode: forwards;
  }

  #htp {
    background: transparent;
    border: 0px;
    margin-top: 140px;
    font-size: 14pt;
    color: gray;
    cursor: pointer;
  }
  

  .lang-switch {
    font-size: 3rem;
    cursor: pointer;
    display: flex;
    justify-content: center;
    user-select: none;
    user-select: none;
  -webkit-user-select: none;
  }
  .lang-switch:active {
    transform: scale(0.9);
  }

@media screen and (max-width:50em) {
  .logo {
    font-size: 5vw;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .hamburger::before {
    content: "☰";
  }
  .close::before {
    content: "✕";
  }
  .hide {
    left:-12em;
  }
}
</style>