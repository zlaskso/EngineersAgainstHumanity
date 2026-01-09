<template>
  <div>
    <p>Game: {{ $route.params.id }}</p>
    <h1>Vinnaren är:</h1>
    <div class="price"> 
      <div class="second">
        2
      </div>

       <div class="first"> 
        1
      </div>

      <div class="third">
        3
      </div>
    </div>
  </div>
</template>

<script> 
export default {
  name: "FinalView"
}
</script>

<style scoped>
.price {
  margin-top: 300px;
  height: 400px;
  padding: 5px;
  font-size: 8rem;

  display: flex;
  align-items: flex-end;
  justify-content: center;
  flex-direction: row;
}

.second, .first, .third {
  width: 15rem;
  background: gray;
  border-radius: 20px 20px 0 0;
  border: 1px solid black;
}

.second {
  height: 70%;
}

.first {
  height: 100%;
}

.third {
  height: 50%; 
}
</style>