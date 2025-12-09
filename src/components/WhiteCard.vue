<template>
  <div class="card" :class="{ selected: selected }" @click="$emit('select', index)">
    <p>{{ prompt }}</p>
  </div>
</template>
<script>
export default {
  data: function () {
    return {
      isSelected: false,
    };
  },
  props: {
    //  uiLabels: Object,   user-select: none;

    prompt: String,
  },
  methods: {
    toggleSelect() {
      this.isSelected = !this.isSelected;
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

.card:hover {
  background: lightgray;
  transform: scale(1.1);
}
.selected {
  border: 3px solid black;
  background: lightgray;
  box-shadow: 0 0 15px black(255, 138, 0, 0.7);
  transform: scale(1.12);
}
</style>
