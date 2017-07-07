// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import Gantt from '@/components/Gantt';
import data from './data.json';

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<Gantt :data="data" />',
  components: { Gantt },
  data() {
    return {
      data,
    };
  },
});
