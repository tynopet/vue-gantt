<template>
  <div id="app">
    <gantt :rows="rows" :legend-help="legendHelp"></gantt>
  </div>
</template>

<script>
import Gantt from './components/Gantt';

export default {
  name: 'app',
  components: {
    Gantt,
  },
  data() {
    return {
      rows: [
        {
          name: 'Задача 1',
          link: '#0',
          values: [
            {
              color: '#F9C4E1',
              desc: 'Задача 1 просрочена!',
              from: 1336171967000,
              to: 1338995668000,
            },
            {
              color: '#D0E4FD',
              desc: 'Задача 1',
              from: 1336135973000,
              to: 1336171967000,
            },
          ],
        },
        {
          name: 'Задача 2',
          link: '#1',
          values: [
            {
              color: '#D0E4FD',
              desc: 'Задача 1',
              from: 1338995668000,
              to: 1338995683000,
            },
          ],
        },
      ],
      legendHelp: 'Help',
    };
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
