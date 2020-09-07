<template>
  <div id="app">
    <NavigationBar/>
    <div class="page">
      <div class="section__container">
        <div class="section__content">
          <router-view />
          <notifications group="sysnotif" position="top left"/> 
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavigationBar from './components/NavigationBar.vue'

export default {
  name: 'App',
  components: {
    NavigationBar
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
  background: #FFFFFF;
  margin-top: 5px;
}

</style>

