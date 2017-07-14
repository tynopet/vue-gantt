<template>
  <div class="gantt column">
    <div class="row">
      <gantt-legend :rows="tasks" :legendHelp="legendHelp" ref="legend" @task-clicked="handleTaskClicked"></gantt-legend>
      <div class="column" @wheel="handleWheel">
        <gantt-header :rows="header" @header-click="handleHeaderClick"></gantt-header>
        <gantt-body :tasks="body"></gantt-body>
      </div>
    </div>
    <gantt-footer :scales="scales" :selected="selectedScaleIdx" :startDate="min" :endDate="max" :step="msInCell" :period="viewportStart" @scale-change="handleScaleChange" @period-change="handlePeriodChange"></gantt-footer>
  </div>
</template>

<script>
import {
  calcBody,
  calcHeader,
  calcMaxScale,
  calcViewport,
  createOptions,
  getMsInScale,
  getMinDate,
  getMaxDate,
  normalizeDate,
  transformInputvalues,
} from '@/hellpers';
import GanttLegend from './GanttLegend';
import GanttHeader from './GanttHeader';
import GanttBody from './GanttBody';
import GanttFooter from './GanttFooter';

const defaultOptions = {
  cellWidth: 24,
  scales: [
    { scale: 'months', steps: [1] },
    { scale: 'days', steps: [1] },
    { scale: 'hours', steps: [12, 8, 6, 3, 1] },
    { scale: 'minutes', steps: [30, 15, 5, 1] },
    { scale: 'seconds', steps: [30, 15, 5, 1] },
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
    const { startDate, endDate, values, tasks } = transformInputvalues(rows);
    this.legendHelp = legendHelp;
    this.startDate = startDate;
    this.endDate = endDate;
    this.values = values.map(value => value.sort((a, b) => a.from - b.from));
    this.tasks = tasks;
  },
  mounted() {
    this.cellsCount = Math.ceil((this.$el.clientWidth - this.$refs.legend.$el.clientWidth)
      / defaultOptions.cellWidth);
    const maxScaleIdx = calcMaxScale(this.startDate, this.endDate, this.cellsCount, this.scales);
    const [scale, step] = this.scales[maxScaleIdx].split(' ');
    this.scale = scale;
    this.step = step;
    this.scales = this.scales.filter((_, idx) => idx >= maxScaleIdx);
    this.viewportStart = this.min;
  },
  data() {
    return {
      startDate: null,
      endDate: null,
      viewportStart: 0,
      cellsCount: 0,
      legendHelp: '',
      tasks: [],
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
      return getMaxDate(
        this.endDate, this.scale, this.step, this.min, this.msInCell, this.cellsCount,
      );
    },
    min() {
      return getMinDate(this.startDate, this.scale);
    },
    msInCell() {
      return getMsInScale(this.scale) * this.step;
    },
    viewport() {
      return calcViewport(this.viewportStart, this.scale, this.step, this.cellsCount);
    },
    selectedScaleIdx() {
      return this.scales.findIndex(el => el === `${this.scale} ${this.step}`);
    },
  },
  methods: {
    handleScaleChange(e) {
      const [scale, step] = e.target.value.split(' ');
      if (this.scale !== scale) this.scale = scale;
      if (this.step !== step) this.step = step;
      this.viewportStart = normalizeDate(this.viewportStart, this.scale, this.step);
      if (this.viewportStart < this.min) this.viewportStart = this.min;
      if (this.viewportStart > this.max) this.viewportStart = this.max;
    },
    handlePeriodChange(e) {
      this.viewportStart = parseInt(e.target.value, 10);
    },
    handleWheel(e) {
      const newViewportStart = e.deltaY > 0
        ? this.viewportStart + this.msInCell
        : this.viewportStart - this.msInCell;
      if (e.deltaY > 0) {
        if (newViewportStart < this.max) {
          this.viewportStart = newViewportStart;
        } else {
          this.viewportStart = this.max;
        }
      } else if (e.deltaY < 0) {
        if (newViewportStart > this.min) {
          this.viewportStart = newViewportStart;
        } else {
          this.viewportStart = this.min;
        }
      }
    },
    handleHeaderClick({ date, scale }) {
      this.scale = scale;
      this.step = 1;
      if (date > this.max) this.viewportStart = this.max;
      else if (date < this.min) this.viewportStart = this.min;
      else this.viewportStart = date;
    },
    handleTaskClicked(start) {
      const viewportStart = normalizeDate(start, this.scale, this.step);
      this.viewportStart = viewportStart > this.max ? this.max : viewportStart;
    },
  },
};
</script>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.row {
  display: flex;
}
</style>
