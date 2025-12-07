<template>
  <div class="lang-switch">
    <span 
      v-bind:class="{ 'opaque': lang !== 'en' }"
      v-on:click="setLanguage('en')">
      🇬🇧
    </span>
    <span 
      v-bind:class="{ 'opaque': lang !== 'sv' }"
      v-on:click="setLanguage('sv')">
      🇸🇪
    </span>
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
    setLanguage(selectedLanguage) {
      if (this.lang !== selectedLanguage) {
        this.$emit('switch-language');
      }
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
  display: flex;
  gap: 15px;
  user-select: none;
  -webkit-user-select: none;
  z-index: 100;
}

span {
  cursor: pointer;
  transition: all 0.2s ease;
}

.opaque {
  opacity: 0.3;
  transform: scale(0.8);
}

span:hover {
  opacity: 1;
  transform: scale(1.1);
}

.lang-switch:active {
  transform: scale(0.9);
}
</style>