<template>
  <div class="right-panel" @wheel="handleScroll">
    <gantt-header :scale="scale" :step="step" :cellWidth="cellWidth" :viewport="viewport"></gantt-header>
    <gantt-body :viewport="viewport" :cellWidth="cellWidth" :rows="values" :msInCell="msInCell"></gantt-body>
    <div class="options">
  
      <input type="range" class="interval" :min="min" :max="max" :step="msInCell" v-model="rewind">
      <select v-model="selectedScale">
        <option v-for="option in options" :value="option.value" :key="option.value">{{ option.text }}</option>
      </select>
    </div>
  </div>
</template>

<script>
import dateFns from 'date-fns';
import GanttHeader from './GanttHeader';
import GanttBody from './GanttBody';

const intervals = {
  days: 'Month',
  hours: 'Day',
  minutes: 'Hour',
};

const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

const calcViewport = (value, scale, cells, step) => {
  const start = parseInt(value, 10);
  const method = `add${capitalize(scale)}`;

  const startDate = dateFns.parse(start);
  const endDate = dateFns[method](dateFns.parse(start), cells * parseInt(step, 10));
  return { startDate, endDate };
};

const getMsInScale = (scale) => {
  switch (scale) {
    case 'days':
      return 86400000;
    case 'hours':
      return 3600000;
    case 'minutes':
      return 60000;
    default:
      return new Error('Invalid format');
  }
};

export default {
  components: {
    GanttHeader,
    GanttBody,
  },
  props: {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    values: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      cellWidth: 24,
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
      panelWidth: 0,
      rangeValue: undefined,
    };
  },
  computed: {
    min() {
      const method = `startOf${intervals[this.scale]}`;
      return dateFns.getTime(dateFns[method](this.startDate));
    },
    max() {
      const method = `endOf${intervals[this.scale]}`;
      return dateFns.getTime(dateFns[method](this.endDate));
    },
    rewind: {
      get() {
        return this.rangeValue || this.min;
      },
      set(value) {
        this.rangeValue = value;
      },
    },
    selectedScale: {
      get() {
        return this.selected;
      },
      set(value) {
        this.selected = value;
        [this.scale, this.step] = value.split(' ');
        this.step = parseInt(this.step, 10);
      },
    },
    viewport() {
      const value = this.rangeValue || this.min;
      return calcViewport(value, this.scale, this.cellInViewport, this.step);
    },
    cellInViewport() {
      return Math.ceil(this.panelWidth / this.cellWidth);
    },
    msInCell() {
      return getMsInScale(this.scale) * this.step;
    },
  },
  methods: {
    handleScroll(e) {
      const newRewind = e.deltaY > 0
        ? this.rewind + this.msInCell
        : this.rewind - this.msInCell;
      if (e.deltaY > 0) {
        if (newRewind < this.max) {
          this.rewind = newRewind;
        } else {
          this.rewind = this.max;
        }
      } else if (e.deltaY < 0) {
        if (newRewind > this.min) {
          this.rewind = newRewind;
        } else {
          this.rewind = this.min;
        }
      }
    },
  },
  mounted() {
    this.panelWidth = this.$el.clientWidth;
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
