<template>
  <div class="ganttBody">
    <div class="task" v-for="(task, idx) in tasks" :key="idx">
      <div class="interval" :style="{ 'background-color': interval.color, width: interval.width + 'px', 'margin-left': interval.offset + 'px', display: interval.display }" v-for="interval in task" :key="interval">
        {{interval.desc}}
      </div>
    </div>
  </div>
</template>

<script>
import isAfter from 'date-fns/is_after';
import isBefore from 'date-fns/is_before';
import memoize from 'lodash/memoize';

const prepareDataToRender = memoize((start, end, rows, msInCell, cellWidth) =>
  rows.map(row => row
    .map(({ from, to, desc, color }, idx) => {
      const offset = idx === 0 && (isAfter(from, start) && isBefore(from, end))
        ? Math.ceil(((from - start) / msInCell) * cellWidth)
        : 0;
      const intervalStart = (isBefore(from, start) && isAfter(to, start))
        ? start
        : from;
      const intervalEnd = (isBefore(from, end) && isAfter(to, end)) ? end : to;
      const display = (isAfter(from, end) || isBefore(to, start)) ? 'none' : '';
      const width = Math.ceil(
        ((intervalEnd - intervalStart) / msInCell) * cellWidth,
      );
      return {
        width,
        offset,
        desc,
        color,
        display,
      };
    })));

export default {
  props: {
    viewport: {
      type: Object,
      required: true,
    },
    rows: {
      type: Array,
      required: true,
    },
    msInCell: {
      type: Number,
      required: true,
    },
    cellWidth: {
      type: Number,
      required: true,
    },
  },
  computed: {
    tasks() {
      return prepareDataToRender(
        this.viewport.startDate,
        this.viewport.endDate,
        this.rows,
        this.msInCell,
        this.cellWidth,
      );
    },
  },
};
</script>

<style>
.ganttBody {
  height: calc(100% - 100px);
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  flex-shrink: 0;
  overflow: hidden;
}

.ganttBody .task {
  display: flex;
  flex-wrap: nowrap;
  line-height: 24px;
  height: 24px;
  flex-shrink: 0;
  overflow: hidden;
}

.ganttBody .task .interval {
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
