<template>
  <div class="gantt column">
    <div class="row">
      <gantt-legend :rows="rows" :legendHelp="legendHelp" ref="legend"></gantt-legend>
      <div class="column" @wheel="wheelHandler">
        <gantt-header :rows="header"></gantt-header>
        <gantt-body :tasks="body"></gantt-body>
      </div>
    </div>
    <gantt-footer
      :scales="scales"
      :startDate="min"
      :endDate="max"
      :step="msInCell"
      :period="startOfPeriod"
      @scale-change="scaleChangeHandler"
      @period-change="periodChangeHandler"
    ></gantt-footer>
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
      return dateFns.getTime(dateFns[method](this.endDate));
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
  },
  methods: {
    scaleChangeHandler({ scale, step }) {
      if (this.scale !== scale) this.scale = scale;
      if (this.step !== step) this.step = step;
    },
    periodChangeHandler(value) {
      this.startOfPeriod = parseInt(value, 10);
    },
    wheelHandler(e) {
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
