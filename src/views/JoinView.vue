<template>
    <header>
    <div v-bind:class="['hamburger', {'close': !hideNav}]" 
         v-on:click="toggleNav">
    </div>
    <router-link to="/">
    <button class="logo">
      <img src="/img/logo.png">
      Engineers Against Humanity
    </button>
    </router-link>
  </header>
  <input id="nameInput" type="text" v-model="nickname" v-bind:placeholder= "uiLabels.joinView?.namePlaceholder">
  <input id="roomInput" type="text" v-model="roomCode" v-bind:placeholder= "uiLabels.joinView?.codePlaceholder"></input><br>
  <button id="join" @click="joinGame">{{uiLabels.joinView?.join}}</button>
</template>


<script>
import ResponsiveNav from '@/components/ResponsiveNav.vue';
import io from "socket.io-client"; 
const socket = io("localhost:3000");


export default {
  name: 'JoinView',
  components: {
    ResponsiveNav,
    nickname: "",
    roomCode: ""
  },

  props: {
    uiLabels: Object
  },

  
  
  methods: {
    toggleNav: function () {
        this.hideNav = ! this.hideNav;},
        
        
        
    joinGame: function() {
        if (!this.nickname || !this.roomCode) {
            alert("Please enter a nickname and a room code.");
            return;
        }
        
        // Försök hämta ett befintligt permanent ID för återanslutning
        const reconnectID = localStorage.getItem("playerID"); 
        
        socket.emit('attemptJoinGame', {
            gameID: this.roomCode, 
            name: this.nickname,
            reconnectID: reconnectID // <--- SKICKA MED RECONNECT-ID
        });
        
        this.$router.push(`/lobby/${this.roomCode}`);
    },
},



data: function () {
  return {
    hideNav: true,
    nickname: '',
    roomCode: ''
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
    margin-bottom: 100px;
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
  .lang-switch {
    font-size: 3rem;   /* Gör flaggan stor */
    cursor: pointer;   /* Visar hand-ikon vid hover */
    display: flex;
    justify-content: center;
    user-select: none; /* Förhindrar att man markerar texten vid snabba klick */
    user-select: none; /* <-- Denna rad stoppar markering/highlighting */
  -webkit-user-select: none;
  }
  .lang-switch:active {
    transform: scale(0.9); /* Liten animation när man klickar */
  }
  button {
    cursor: pointer;
  }
  input[type=text] {
    margin: 20px;
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

  button {
    cursor: pointer;
  }
</style>