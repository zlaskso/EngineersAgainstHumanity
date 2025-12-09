<template>
  <div class="card">
    <p>{{ prompt }}</p>
  </div>
</template>
<script>
export default {
  data: function () {
    return {};
  },
  props: {
    //  uiLabels: Object,
    prompt: String,
  },
};
</script>

<style scoped>
.card {
  background: black;
  color: white;
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
}
.card:hover {
  background: rgb(48, 46, 46);
  transform: scale(1.1);
  transition-duration: 1s;
}
</style>
