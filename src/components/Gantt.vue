<template>
  <div class="gantt column">
    <div class="row">
      <gantt-legend :rows="rows" :legendHelp="legendHelp" ref="legend"></gantt-legend>
      <div class="column" @wheel="handleWheel">
        <gantt-header :rows="header" @header-click="handleHeaderClick"></gantt-header>
        <gantt-body :tasks="body"></gantt-body>
      </div>
    </div>
    <gantt-footer :scales="scales" :selected="selectedScaleIdx" :startDate="min" :endDate="max" :step="msInCell" :period="startOfPeriod" @scale-change="handleScaleChange" @period-change="handlePeriodChange"></gantt-footer>
  </div>
</template>

<script>
import dateFns from 'date-fns';
import {
  calcBody,
  calcHeader,
  calcViewport,
  createOptions,
  getMsInScale,
  intervals,
  transformInputvalues,
} from '@/hellpers';
import GanttLegend from './GanttLegend';
import GanttHeader from './GanttHeader';
import GanttBody from './GanttBody';
import GanttFooter from './GanttFooter';

const defaultOptions = {
  cellWidth: 24,
  scales: [
    { scale: 'days', steps: [1] },
    { scale: 'hours', steps: [12, 8, 6, 3, 1] },
    { scale: 'minutes', steps: [30, 15, 5, 1] },
  ],
};

export default {
  components: {
    GanttLegend,
    GanttHeader,
    GanttBody,
    GanttFooter,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  created() {
    const { rows, legendHelp } = this.data;
    const { startDate, endDate, values } = transformInputvalues(rows);
    this.legendHelp = legendHelp;
    this.rows = rows.map(({ link, name }) => ({ link, name }));
    this.startDate = startDate;
    this.endDate = endDate;
    this.startOfPeriod = this.min;
    this.values = values.map(value => value.sort((a, b) => a.from - b.from));
  },
  mounted() {
    this.cellsCount = (this.$el.clientWidth - this.$refs.legend.$el.clientWidth)
      / defaultOptions.cellWidth;
  },
  data() {
    return {
      startDate: null,
      endDate: null,
      startOfPeriod: null,
      cellsCount: 0,
      legendHelp: '',
      scales: createOptions(defaultOptions.scales),
      scale: defaultOptions.scales[0].scale,
      step: defaultOptions.scales[0].steps[0],
      values: [],
    };
  },
  computed: {
    body() {
      return calcBody(this.viewport, this.values, this.msInCell, defaultOptions.cellWidth);
    },
    header() {
      return calcHeader(this.viewport, this.scale, this.step, defaultOptions.cellWidth);
    },
    max() {
      const method = `endOf${intervals[this.scale]}`;
      const max = dateFns.getTime(dateFns[method](this.endDate))
        - dateFns.differenceInMilliseconds(this.viewport.endDate, this.viewport.startDate);
      return max < this.min ? this.min : max;
    },
    min() {
      const method = `startOf${intervals[this.scale]}`;
      return dateFns.getTime(dateFns[method](this.startDate));
    },
    msInCell() {
      return getMsInScale(this.scale) * this.step;
    },
    viewport() {
      return calcViewport(this.startOfPeriod, this.scale, this.step, this.cellsCount);
    },
    selectedScaleIdx() {
      return this.scales.findIndex(el => el === `${this.scale} ${this.step}`);
    },
  },
  methods: {
    handleScaleChange({ scale, step }) {
      if (this.scale !== scale) this.scale = scale;
      if (this.step !== step) this.step = step;
      if (this.startOfPeriod < this.min) this.startOfPeriod = this.min;
      if (this.startOfPeriod > this.max) this.startOfPeriod = this.max;
    },
    handlePeriodChange(value) {
      this.startOfPeriod = parseInt(value, 10);
    },
    handleWheel(e) {
      const newStartOfPeriod = e.deltaY > 0
        ? this.startOfPeriod + this.msInCell
        : this.startOfPeriod - this.msInCell;
      if (e.deltaY > 0) {
        if (newStartOfPeriod < this.max) {
          this.startOfPeriod = newStartOfPeriod;
        } else {
          this.startOfPeriod = this.max;
        }
      } else if (e.deltaY < 0) {
        if (newStartOfPeriod > this.min) {
          this.startOfPeriod = newStartOfPeriod;
        } else {
          this.startOfPeriod = this.min;
        }
      }
    },
    handleHeaderClick({ date, scale }) {
      this.scale = scale;
      this.step = 1;
      if (date > this.max) this.startOfPeriod = this.max;
      else if (date < this.min) this.startOfPeriod = this.min;
      else this.startOfPeriod = date;
    },
  },
};
</script>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
}

.row {
  display: flex;
}
</style>
