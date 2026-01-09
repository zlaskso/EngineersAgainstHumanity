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
    padding: 40px;
    padding-bottom: 300px;
    margin-top: 100px;
    font-size: 26pt;
    font-weight: bold;
    cursor: pointer;
    text-align: left;
  }

   .startButton:hover {
    animation-name: growAnimation;
    animation-duration: 0.5s;
    animation-fill-mode: forwards;
  }


  #createButton {
    background-color: black;
    color: white;
    border: 2px solid black;
    rotate: -10deg;
  }

  #joinButton {
    background-color: white;
    color: black;
    border: 2px solid black;
    rotate: 10deg;
  }

  #htp {
    background: transparent;
    border: 0px;
    margin-top: 75px;
    font-size: 17pt;
    color: gray;
    cursor: pointer;
  }

  #htp:hover {
    animation-name: grayToBlack;
    animation-duration: 0.5s;
    animation-fill-mode: forwards;
  }

@media screen and (max-width: 900px) {
  .startButton {
    width: 173px;
    height: 248.5px;
    padding-bottom: 200px;
    padding-left: 30px;
    text-align: center;
  }
}
</style>