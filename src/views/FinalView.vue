<template>
  <div>
    <p>Game: {{ $route.params.id }}</p>
    <h1>Vinnaren är:</h1>
    <div class="price"> 
      {{ secondPlace()?.name }}
      <div class="second">
        2
      </div>

       <div class="first"> 
        {{ firstPlace()?.name }}
        1
      </div>

      <div class="third">
        {{ thirdPlace()?.name }}
        3
      </div>
    </div>
  </div>
</template>

<script> 
import io from "socket.io-client";
const socket = io();

export default {
  name: "FinalView",

  data() {
    return {
      gameID: "",
      localPlayerID: sessionStorage.getItem("playerID"),
      winnerNames: [],
      blackCardIndex: null,
      winningCardIndexes: [],
      allSubmittedCards: [], 
      participants: [],
      playerWithSubmissions: {},
    };
  },

  created() {
    this.gameID = this.$route.params.id;

    socket.emit("join", this.gameID);
    socket.emit("getRoundResult", { gameID: this.gameID });

    socket.on("roundResult", (data) => {
      this.winnerNames = data.winnerNames || [];
      this.blackCardIndex = Number(data.blackCardIndex);
      this.winningCardIndexes = data.winningCardIndexes || [];
      this.allSubmittedCards = data.allSubmittedCards || []; 
      this.participants = data.participants;
      socket.emit("getPlayerSubmissions", this.gameID);
    });

    socket.on("roundFinished", (data) => {
    this.winnerNames = data.winnerNames || [];
    this.blackCardIndex = Number(data.blackCardIndex);
    this.winningCardIndexes = data.winningCardIndexes || [];
    this.allSubmittedCards = data.allSubmittedCards || [];
    this.participants = data.participants || [];
    });
  },

  computed: {
  sortedParticipants() {
      return [...this.participants].sort((a, b) => b.points - a.points);
    },
  },
  
  methods: {
    firstPlace(){
      return this.sortedParticipants[0];
    }, 
    secondPlace(){
      console.log(this.sortedParticipants[0]);
      return this.sortedParticipants[1];
    },

    thirdPlace(){
      return this.sortedParticipants[2];
    }
  }
}
</script>

<style scoped>
.price {
  margin-top: 300px;
  height: 400px;
  padding: 5px;
  font-size: 8rem;

  display: flex;
  align-items: flex-end;
  justify-content: center;
  flex-direction: row;
}

.second, .first, .third {
  width: 15rem;
  background: white;
  border-radius: 20px 20px 0 0;
  border: 1px solid black;
}

.second {
  height: 70%;
}

.first {
  height: 100%;
}

.third {
  height: 50%; 
}
</style>