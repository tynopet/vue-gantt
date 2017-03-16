<template>
  <div class="gantt-header">
    <div class="row" v-for="row in rows">
      <div class="row-item" v-for="obj in row" :style="{ width: obj.width + 'px' }">{{ obj.moment }}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['viewport', 'scale', 'step', 'cellWidth'],
  data() {
    return {
      rows: [],
      scales: [],
    };
  },
  watch: {
    viewport(value) {
      this.prepareDataToRender(value.startDate, value.endDate);
    },
    scale() {
      this.switchScale();
    },
    step() {
      this.switchScale();
    },
    scales() {
      this.prepareDataToRender(this.viewport.startDate, this.viewport.endDate);
    },
  },
  methods: {
    prepareDataToRender(start, end) {
      this.rows = [];
      this.scales.forEach((scale) => {
        const tmp = [];
        for (const date = start.clone(); date < end;
              date.add(scale.add, scale.addType).startOf(scale.method)) {
          tmp.push({
            moment: date[scale.method](),
            width: this.cellWidth * scale.get(date, end, this.step) * scale.factor,
          });
        }
        this.rows.unshift(tmp);
      });
    },
    getDaysInMonth(start, end) {
      let days;
      if (start.isSame(end, 'month')) {
        days = (end.date() - start.date()) + 1;
      } else {
        days = (start.daysInMonth() - start.date()) + 1;
      }
      return days;
    },
    getHoursInDay(start, end, step) {
      let hours;
      if (start.isSame(end, 'day')) {
        hours = ((end.hour() - start.hour()) + 1) / step;
      } else {
        hours = (24 - start.hour()) / step;
      }
      return hours;
    },
    getMinutesInHour(start, end, step) {
      let minutes;
      if (start.isSame(end, 'hour')) {
        minutes = ((end.minute() - start.minute()) + 1) / step;
      } else {
        minutes = (60 - start.minute()) / step;
      }
      return minutes;
    },
    switchScale() {
      switch (this.scale) {
        case 'days':
          this.scales = [
            {
              method: 'date',
              addType: 'd',
              add: this.step,
              factor: 1,
              get: () => 1,
            },
            {
              method: 'month',
              addType: 'M',
              add: 1,
              factor: 1,
              get: this.getDaysInMonth,
            },
            {
              method: 'year',
              addType: 'y',
              add: 1,
              factor: 1,
              get: (start, end) => end.diff(start, 'days') + 1,
            },
          ];
          break;
        case 'hours':
          this.scales = [
            {
              method: 'hour',
              addType: 'h',
              add: this.step,
              factor: 1,
              get: () => 1,
            },
            {
              method: 'date',
              addType: 'd',
              add: 1,
              factor: 1,
              get: this.getHoursInDay,
            },
            {
              method: 'month',
              addType: 'M',
              add: 1,
              factor: 24 / this.step,
              get: this.getDaysInMonth,
            },
          ];
          break;
        case 'minutes':
          this.scales = [
            {
              method: 'minute',
              addType: 'm',
              add: this.step,
              factor: 1,
              get: () => 1,
            },
            {
              method: 'hour',
              addType: 'h',
              add: 1,
              factor: 1,
              get: this.getMinutesInHour,
            },
            {
              method: 'date',
              addType: 'd',
              add: 1,
              factor: 60,
              get: this.getHoursInDay,
            },
          ];
          break;
        default:
          console.error('Invalid format');
      }
    },
  },

  created() {
    this.switchScale();
  },
};
</script>

<style>
.gantt-header {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 72px;
  flex-shrink: 0;
}

.gantt-header .row {
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start;
} 

.gantt-header .row .row-item {
  box-sizing: border-box;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f6f6f6;
  border-bottom: 1px solid #ddd;
  border-right: 1px solid #ddd;
}
</style>
