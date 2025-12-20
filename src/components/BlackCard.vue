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
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  width: 100%;
  height: 100%;
  font-size: 1.5rem;
  box-sizing: border-box;

  /* kortproportion */
  aspect-ratio: 200 / 280;

  /* padding texten */
  padding: 2rem; /* öka från t.ex. 1rem till 2rem */
}
</style>
