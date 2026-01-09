<template>
  <div>
    <p>Game: {{ $route.params.id }}</p>
    <h1>Vinnaren är:</h1>


    <div class="price"> 
      <div class= "col second">
      <div class="winner-name">{{ secondPlace()?.name }}</div>
       <div class="podium"> 2 </div>
      </div>

      <div class="col first">
        <div class="winner-name">{{ firstPlace()?.name }}</div>
        <div class="podium"> 1 </div>
      </div>

      <div class="col third">
        <div class="winner-name">{{ thirdPlace()?.name }}</div>
        <div class="podium"> 3 </div>
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
      const sorted = [...this.participants].sort((a, b) => b.points - a.points);
      console.log(sorted);
      return sorted;
    },
  },
  methods: {

    firstPlace(){
      if (!this.sortedParticipants.length) return "Laddar...";
      return this.sortedParticipants[0];
    }, 
    secondPlace(){
      if (!this.sortedParticipants.length) return "Laddar...";
      console.log(this.sortedParticipants[0]);
      return this.sortedParticipants[1];
    },

    thirdPlace(){
      if (!this.sortedParticipants.length) return "Laddar...";
      return this.sortedParticipants[2];
    },
}
};
</script>

<style scoped>
.price {
  height: 400px;
  display: grid;
  font-size: 2rem;
  grid-template-columns: repeat(3, 15rem);
  grid-template-rows: auto 1fr;
  justify-content: center;
}

.col{
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

.second, .first, .third {
  width: 15rem;
  font-size: 8rem;
  background: white;
  border-radius: 20px 20px 0 0;
  align-self: end;
}

.second {
  grid-column: 1;
  grid-row: 1;
  height: 70%;
}

.first {
  grid-column: 2;
  grid-row: 1;
  height: 100%;
}

.third {
  grid-column: 3;
  grid-row: 1;
  height: 50%; 
}

.winner-name {
  font-size: 1.5rem;
  text-align: center;
  width: 100%;
  margin-bottom: 10px;
}

  .podium{
  width:100%;
  background: white;
  border-radius: 20px 20px 0 0;
  border: 1px solid black;
  font-size: 8rem;
  display: flex;
  justify-content: center;
  align-items: center;
  }

.first .podium { height: 100%; }
.second .podium { height: 70%; }
.third .podium { height: 50%; }

</style>