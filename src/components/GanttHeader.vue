<template>
  <div class="gantt-header">
    <div class="row" v-for="(row, idx) in rows" :key="idx">
      <div class="row-item" v-for="(obj, idx) in row" :key="idx" :style="{ width: obj.width + 'px' }">{{ obj.label }}</div>
    </div>
  </div>
</template>

<script>
import dateFns from 'date-fns';
import memoize from 'lodash/memoize';

const getDaysInMonth = memoize((start, end) => {
  if (dateFns.isSameMonth(start, end)) {
    return (dateFns.getDate(end) - dateFns.getDate(start)) + 1;
  }
  return (dateFns.getDaysInMonth(start) - dateFns.getDate(start)) + 1;
});

const getHoursInDay = memoize((start, end, step) => {
  if (dateFns.isSameDay(start, end)) {
    return ((dateFns.getHours(end) - dateFns.getHours(start)) + 1) / step;
  }
  return (24 - dateFns.getHours(start)) / step;
});

const getMinutesInHour = memoize((start, end, step) => {
  if (dateFns.isSameHour(start, end)) {
    return ((dateFns.getMinutes(end) - dateFns.getMinutes(start)) + 1) / step;
  }
  return (60 - dateFns.getMinutes(start)) / step;
});

const switchScale = (scale, step) => {
  switch (scale) {
    case 'days':
      return [
        {
          method: dateFns.getYear,
          addType: dateFns.addYears,
          start: dateFns.startOfYear,
          add: 1,
          factor: 1,
          get: (start, end) => dateFns.differenceInDays(end, start) + 1,
        },
        {
          method: dateFns.getMonth,
          addType: dateFns.addMonths,
          start: dateFns.startOfMonth,
          add: 1,
          factor: 1,
          get: getDaysInMonth,
        },
        {
          method: dateFns.getDate,
          addType: dateFns.addDays,
          start: dateFns.startOfDay,
          add: step,
          factor: 1,
          get: () => 1,
        },
      ];
    case 'hours':
      return [
        {
          method: dateFns.getMonth,
          addType: dateFns.addMonths,
          start: dateFns.startOfMonth,
          add: 1,
          factor: 24 / step,
          get: getDaysInMonth,
        },
        {
          method: dateFns.getDate,
          addType: dateFns.addDays,
          start: dateFns.startOfDay,
          add: 1,
          factor: 1,
          get: getHoursInDay,
        },
        {
          method: dateFns.getHours,
          addType: dateFns.addHours,
          start: dateFns.startOfHour,
          add: step,
          factor: 1,
          get: () => 1,
        },
      ];
    case 'minutes':
      return [
        {
          method: dateFns.getDate,
          addType: dateFns.addDays,
          start: dateFns.startOfDay,
          add: 1,
          factor: 60,
          get: getHoursInDay,
        },
        {
          method: dateFns.getHours,
          addType: dateFns.addHours,
          start: dateFns.startOfHour,
          add: 1,
          factor: 1,
          get: getMinutesInHour,
        },
        {
          method: dateFns.getMinutes,
          addType: dateFns.addMinutes,
          start: dateFns.startOfMinute,
          add: step,
          factor: 1,
          get: () => 1,
        },
      ];
    default:
      return new Error('Invalid format');
  }
};

const prepareDataToRender = memoize((start, end, scales, cellWidth, step) => scales.map((scale) => {
  const tmp = [];
  for (let date = new Date(dateFns.getTime(start));
    dateFns.isBefore(date, end);
    date = scale.start(scale.addType(date, scale.add))) {
    tmp.push({
      label: scale.method(date),
      width: cellWidth * scale.get(date, end, step) * scale.factor,
    });
  }
  return tmp;
}));

export default {
  props: {
    viewport: {
      type: Object,
      required: true,
    },
    scale: {
      type: String,
      required: true,
    },
    step: {
      type: Number,
      required: true,
    },
    cellWidth: {
      type: Number,
      required: true,
    },
  },
  computed: {
    rows() {
      return prepareDataToRender(
        this.viewport.startDate, this.viewport.endDate, this.scales, this.cellWidth, this.step,
      );
    },
    scales() {
      return switchScale(this.scale, this.step);
    },
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
