<template>
    <header>
    <div v-bind:class="['hamburger', {'close': !hideNav}]" 
         v-on:click="toggleNav">
    </div>
    <button class="logo" @click="homePage">
      <img src="/img/logo.png">
      Engineers Against Humanity
    </button>
  </header>
  <input id="nameInput" type="text" v-model="nickname" v-bind:placeholder= "uiLabels.joinView?.namePlaceholder">
  <input id="roomInput" type="text" v-model="roomCode" v-bind:placeholder= "uiLabels.joinView?.codePlaceholder"></input><br>
  <button class="default-btn" @click="joinGame">{{uiLabels.joinView?.join}}</button>
</template>


<script>
import ResponsiveNav from '@/components/ResponsiveNav.vue';
import io from "socket.io-client";
const socket = io();


export default {
  name: 'JoinView',
  components: {
    ResponsiveNav,
    nickname: "",
    roomCode: ""
  },

  created: function() {

    sessionStorage.removeItem("hostPlayerID");
  },

  props: {
    uiLabels: Object
  },

  data: function () {
  return {
    hideNav: true,
    nickname: '',
    roomCode: ''
    }
  },

  methods: {
  toggleNav() {
      this.hideNav = !this.hideNav;
    },

    joinGame() {
      if(!this.roomCode || !this.nickname) {
        alert("Fill both fields to join a game!");
        return;
      }

      socket.emit("attemptJoinGame", {
        gameID: this.roomCode,
        nickname: this.nickname,
      });
      
      socket.on("playerJoinedGame", (d) => {
        sessionStorage.setItem("playerID", d.playerID);
        sessionStorage.setItem("playerName", d.nickname);
        this.$router.push(`/lobby/${d.gameID}`);
      });

    },
    homePage: function() {
    this.$router.push(`/`);
  }
  },
  

}

</script>

<style scoped>

  button {
    cursor: pointer;
  }
  input[type=text] {
    margin: 20px;
    margin-top: 100px;
    padding: 10px;
    height: 50px;
    width: 350px;
    font-size: 20pt;
    border-radius: 10px;
    outline: none;
    border: 2px solid gray;
  }
  input[type=text] {
    border-color: black;
    border-radius: 10px;
    outline: none;
  }

  #join {
    background: white;
    border-radius: 10px;
    border: 2px solid black;
    outline: none;
    width: 200px;
    height: 50px;
    margin-top: 100px;
    font-size: 20pt;
    font-weight: bold;
    color: black;
    cursor: pointer;
  }
  #join:hover {
    animation-name: grayToBlack;
    animation-duration: 0.5s;
    animation-fill-mode: forwards;
  }

 @keyframes grayToBlack {
    from {scale: 1;}
    to {scale: 1.05;}
  }
  
</style>