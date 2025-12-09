<template>
  <div class="wrapper">
    <div class="bar" v-for="(item, index) in labels" v-bind:key="'a' + index">
      <div v-bind:style="{ height: (data?.[item] || 0) + 'px' }">
        <span> {{ data?.[item] || 0 }} </span>
      </div>
      <div class="label">
        {{ item }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "BarsComponent",
  props: {
    labels: Array,
    data: Object,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
span {
  color: var(--background-color);
}
.bar {
  display: inline-block;
  width: 50px;
  vertical-align: bottom;
}

.bar span {
  position: relative;
  top: -1.2em;
}

.bar div {
  background-color: red;
}
.bar:nth-child(n) div:nth-child(1) {
  background-color: red;
}
.bar:nth-child(2n) div:nth-child(1) {
  background-color: blue;
}
.bar:nth-child(3n) div:nth-child(1) {
  background-color: teal;
}
.bar:nth-child(4n) div:nth-child(1) {
  background-color: purple;
}
.bar:nth-child(5n) div:nth-child(1) {
  background-color: yellow;
}
.bar .label {
  background-color: white;
}

.wrapper {
  padding: 3em;
}
</style>
