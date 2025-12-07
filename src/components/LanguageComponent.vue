<template>
  <div class="lang-switch" v-on:click="switchLanguage">
    <span v-if="lang === 'sv'">🇸🇪</span>
    <span v-else>🇬🇧</span>
  </div>
</template>

<script>
export default {
  name: 'LanguageComponent',
  props: {
    lang: String
  },
  emits: ['switch-language'],
  methods: {
    switchLanguage() {
      this.$emit('switch-language');
    }
  }
}
</script>

<style scoped>
.lang-switch {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 3rem;
  cursor: pointer;
  display: flex;
  user-select: none;
  -webkit-user-select: none;
  z-index: 100;
}
.lang-switch:active {
  transform: scale(0.9);
}
</style>