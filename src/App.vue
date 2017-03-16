<template>
  <div id="app">
    <gantt></gantt>
  </div>
</template>

<script>
import Gantt from './components/Gantt';

export default {
  name: 'app',
  components: {
    Gantt,
  },
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
