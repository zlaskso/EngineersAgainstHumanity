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
    <p>{{ uiLabels.aboutView?.explanation1 }}</p>
    <img class="explanationImg" src="/img/explanation1.png"></img>
    <p>{{ uiLabels.aboutView?.explanation2 }}</p>
    <router-link to="/">
    <button id="back">{{uiLabels.common?.back}}</button>
    </router-link>
</template>

<script>
import ResponsiveNav from '@/components/ResponsiveNav.vue';

export default {
    name: "AboutView",
    components: {
    ResponsiveNav
  },

  props: {
    uiLabels: Object
  },
    data: function () {
        return {
            aboutExplanations: {},
            hideNav: true
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
    margin-bottom: 50px;
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
    font-size: 3rem;
    cursor: pointer;
    display: flex;
    justify-content: center;
    user-select: none;
    user-select: none;
  -webkit-user-select: none;
  }
  .lang-switch:active {
    transform: scale(0.9);
  }
p {
    color: black;
}
.explanationImg {
    width: 500px;
}
#back {
    background: transparent;
    border: 0px;
    margin-top: 140px;
    font-size: 14pt;
    color: gray;
    cursor: pointer;
  }

#back:hover {
    animation-name: grayToBlack;
    animation-duration: 0.5s;
    animation-fill-mode: forwards;
  }

 @keyframes grayToBlack {
    from {color:gray}
    to {color: black}
  }

  button {
    cursor: pointer;
  }
</style>