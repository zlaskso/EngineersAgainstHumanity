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
  <div class="explanation-container">
        <div class="step">
    <h2>1. {{uiLabels.aboutView?.title1}}</h2>
            <p>{{ uiLabels.aboutView?.explanation1 }}</p>
            <p>{{ uiLabels.aboutView?.explanation2 }}</p>
            <img class="explanationImg" src="/img/explanation1.png">
        </div>

        <div class="step">
            <h2>2. {{uiLabels.aboutView?.title2}}</h2>
            <ol class="game-flow-list">
                <li>
                    <strong>{{ uiLabels.aboutView?.undertitle2 }}</strong> {{ uiLabels.aboutView?.explanation3 }}
                    <br>
                    
                    
                </li>
                <li>
                    <strong>{{ uiLabels.aboutView?.undertitle3 }}</strong> {{ uiLabels.aboutView?.explanation4 }} 
                    <span v-if="uiLabels.aboutView?.explanation5">({{ uiLabels.aboutView?.explanation5 }})</span>
                </li>

                <li>
                    <strong>{{ uiLabels.aboutView?.undertitle4 }}</strong> {{ uiLabels.aboutView?.explanation7 }}
                </li>

                <li>
                    <strong>{{ uiLabels.aboutView?.undertitle5 }}</strong> {{ uiLabels.aboutView?.explanation8 }}
                </li>
            </ol>
        </div>
        <div class="step">
            <h2>3. {{uiLabels.aboutView?.title3}}</h2>
            <p>{{ uiLabels.aboutView?.explanation9 }}</p>
        </div> 
  </div>
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



.explanation-container {
    max-width: 800px;
    margin: 0 auto 50px auto;
    padding: 20px;
    text-align: left;
}

.step {
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #ccc;
}

.game-flow-list {
    list-style-type: none; /* Ta bort standardpunkt */
    counter-reset: step-counter; /* Starta egen räknare */
    padding-left: 0;
}

.game-flow-list li {
    margin-bottom: 15px;
    padding-left: 2em;
    position: relative;
}

/* Numerering för listan (A, B, C...) */
.game-flow-list li::before {
    counter-increment: step-counter;
    content: counter(step-counter, upper-alpha) "."; /* Använd A., B., C. */
    position: absolute;
    left: 0;
    font-weight: bold;
    color: black;
}


h2 {
    font-size: 1.5rem;
    border-left: 5px solid black; /* Tydlig visuell separation */
    padding-left: 10px;
}


</style>