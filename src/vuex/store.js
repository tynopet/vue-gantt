import Vue from 'vue';
import Vuex from 'vuex';
// import moment from 'moment';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    legend: 'Help',
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
  },
  getters: {
    startDate(state) {
      return Math.min.apply(null,
        state.rows.map(row => Math.min.apply(null, row.values.map(value => value.from))),
      ) || new Date().valueOf();
    },
    endDate(state) {
      return Math.max.apply(null,
        state.rows.map(row => Math.max.apply(null, row.values.map(value => value.to))),
      ) || new Date().valueOf();
    },
    values(state) {
      return state.rows.map(row => row.values.sort((a, b) => a.from - b.from));
    },
  },
  mutations: {

  },
});

export default store;
