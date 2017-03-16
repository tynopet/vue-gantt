<template>
  <div class="right-panel">
    <gantt-header :scale="scale"
                :step="step"
                :cellWidth="cellWidth"
                :viewport="viewport"></gantt-header>
    <gantt-body :viewport="viewport"
                :cellWidth="cellWidth"
                :rows="values"
                :msInCell="msInCell"></gantt-body>
    <div class="options">
      <input type="range" class="interval" :min="min" :max="max" :step="msInCell" v-model="rangeValue">
      <select v-model="selected">
        <option v-for="option in options" :value="option.value">{{ option.text }}</option>
      </select>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import GanttHeader from './GanttHeader';
import GanttBody from './GanttBody';

const intervals = {
  days: 'month',
  hours: 'day',
  minutes: 'hour',
};

export default {
  props: ['startDate', 'endDate', 'values'],
  components: {
    GanttHeader,
    GanttBody,
  },
  watch: {
    rangeValue(value) {
      this.calcViewport(value);
    },
    selected(value) {
      [this.scale, this.step] = value.split(' ');
      this.calcMsInCell();
      this.calcViewport(this.rangeValue);
    },
  },
  computed: {
    min() {
      return +moment(this.startDate).startOf(intervals[this.scale]);
    },
    max() {
      return +moment(this.endDate).endOf(intervals[this.scale]);
    },
  },
  methods: {
    calcViewport(value) {
      const start = parseInt(value, 10);
      const startDate = moment(start);
      const endDate = moment(start)
                      .add(this.cellInViewport * parseInt(this.step, 10), this.scale);
      this.viewport = { startDate, endDate };
    },
    calcMsInCell() {
      switch (this.scale) {
        case 'days':
          this.msInCell = 86400000 * this.step;
          break;
        case 'hours':
          this.msInCell = 3600000 * this.step;
          break;
        case 'minutes':
          this.msInCell = 60000 * this.step;
          break;
        default:
          console.error('Invalid format');
      }
    },
  },
  data() {
    return {
      cellWidth: 24,
      cellInViewport: 0,
      viewport: {},
      options: [
        { text: 'Дни', value: 'days 1' },
        { text: 'Часы 12', value: 'hours 12' },
        { text: 'Часы 8', value: 'hours 8' },
        { text: 'Часы 6', value: 'hours 6' },
        { text: 'Часы 3', value: 'hours 3' },
        { text: 'Часы 1', value: 'hours 1' },
        { text: 'Минуты 30', value: 'minutes 30' },
        { text: 'Минуты 15', value: 'minutes 15' },
        { text: 'Минуты 5', value: 'minutes 5' },
        { text: 'Минуты 1', value: 'minutes 1' },
      ],
      selected: 'days 1',
      scale: 'days',
      step: 1,
      rangeValue: this.startDate,
      msInCell: null,
      dates: {
        start: null,
        end: null,
      },
    };
  },
  created() {
    this.calcMsInCell();
  },
  mounted() {
    this.cellInViewport = Math.ceil(this.$el.clientWidth / this.cellWidth);
    this.calcViewport(this.rangeValue);
  },
};
</script>

<style>
.right-panel {
  overflow: hidden;
  width: 100%;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
}

.right-panel .options {
  display: flex;
  justify-content: space-between;
}

.right-panel .options .interval {
  width: 100%;
}
</style>
