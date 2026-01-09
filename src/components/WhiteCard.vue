<template>
  <div
    class="card"
    :class="{ selected: selected, 'no-hover': isHost }"
    @click="$emit('select', index)"
  >
    <p>{{ prompt }}</p>
    <div v-if="showName && playerName" class="player-name-tag">
      {{ playerName }}
    </div>
  </div>
</template>
<script>
export default {
  data: function () {},
  props: {
    //  uiLabels: Object,   user-select: none;
    prompt: String,
    index: Number,
    selected: Boolean,
    playerName: String,
    showName: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    toggleSelect() {
      this.isSelected = !this.isSelected;
    },
  },
  computed: {
    isHost() {
      return sessionStorage.getItem("hostPlayerID") !== null;
    },
  },
};
</script>

<style scoped>
.card {
  background: white;
  padding: 20px;
  width: 200px;
  height: 280px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
  text-align: center;
  cursor: pointer;
  user-select: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:not(.no-hover):hover {
  background: lightgray;
  transform: scale(1.1);
}

.no-hover {
  cursor: default; /* Remove the pointer cursor for the host */
}

.selected {
  border: 3px solid black;
  background: lightgray;
  box-shadow: 0 0 15px black(255, 138, 0, 0.7);
  transform: scale(1.12);
}

.player-name-tag {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 1.2rem;
  font-weight: bold;
  color: gray;
  padding: 2px 8px;
}

.small-card-wrapper .player-name-tag {
  margin-right: -70px;
  margin-bottom: -10px;
  font-size: 1.1rem;
}
.white-card.disabled {
  cursor: default;
  transform: none !important;
  box-shadow: none !important;
}
.card-view .card {
  font-size: 30px;
  @media (min-width: 900px) {
    font-size: 1.2rem;
  }
}
</style>
