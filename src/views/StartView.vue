<template>
  <header>
    <div v-bind:class="['hamburger', {'close': !hideNav}]" 
         v-on:click="toggleNav">
    </div>
    <button class="logo">
      <img src="/img/logo.png">
      Engineers Against Humanity
    </button>
  </header>
  <router-link to="/create/">
  <button class="startButton" id="createButton">
    {{uiLabels.startView?.createGame}}
  </button>
  </router-link>
  <router-link to="/join/">
  <button class="startButton" id="joinButton">
    {{uiLabels.startView?.joinGame}}
  </button>
  </router-link>
  <div>
  <p v-if="false"class="tagline">{{uiLabels.startView?.info}}</p>
  </div>
  <footer>
    <router-link to="/about/">
    <button id="htp">{{uiLabels.startView?.htp}}</button>
    </router-link>
  </footer>
</template>

<script>
import ResponsiveNav from '@/components/ResponsiveNav.vue';

export default {
  name: 'StartView',
  components: {
    ResponsiveNav
  },

  props: {
    uiLabels: Object
  },

  data: function () {
    return {
      newPollId: "",
      hideNav: true,
    }
  },
  methods: {
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
    grid-template-columns: 2em auto 5rem;
    align-items: center;
  }
  .logo {
    letter-spacing: 0.08em;
    font-size: 3rem;
    font-weight: bold;
    padding-top:0.5em;
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
    padding:2rem;
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
    margin-top: 200px;
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
    margin-top: 75px;
    font-size: 17pt;
    color: gray;
    cursor: pointer;
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