<template>
    <header>
    <div v-bind:class="['hamburger', {'close': !hideNav}]" 
         v-on:click="toggleNav">
    </div>
    <button class="logo" @click="homePage">
      <img src="/img/logo.png">
      Engineers Against Humanity
    </button>
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
    },

    methods: {
  homePage: function() {
    this.$router.push(`/`);
  }

}
}
    
</script>

<style scoped>
 
p {
    color: black;
}
.explanationImg {
    width: 500px;
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

@media (max-width: 900px) {

.explanationImg {
    width: 300px;
}

}

</style>