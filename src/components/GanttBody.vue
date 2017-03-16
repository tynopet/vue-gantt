<template>
  <div class="ganttBody">
    <div class="task" v-for="task in tasks">
      <div class="interval" 
            :style="{ 'background-color': interval.color,
                        width: interval.width + 'px',
                        'margin-left': interval.offset + 'px',
                        visibility: interval.visibility
                    }" 
            v-for="interval in task">{{interval.desc}}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['viewport', 'rows', 'msInCell', 'cellWidth'],
  data() {
    return {
      tasks: [],
    };
  },
  watch: {
    viewport(value) {
      this.prepareDataToRender(value.startDate, value.endDate);
    },
  },
  methods: {
    prepareDataToRender(start, end) {
      this.tasks = [];
      this.rows.forEach((row) => {
        const task = [];
        row.forEach((interval, idx) => {
          const bar = {
            width: 0,
            offset: 0,
            desc: interval.desc,
            color: interval.color,
            visibility: 'visible',
          };
          let intervalStart = interval.from;
          let intervalEnd = interval.to;
          if (interval.from > start && interval.from < end) {
            if (idx === 0) {
              bar.offset = Math.ceil(((interval.from - start) / this.msInCell) * this.cellWidth);
            }
          }
          if (interval.from < start && interval.to > start) {
            intervalStart = start;
          }
          if (interval.from < end && interval.to > end) {
            intervalEnd = end;
          }
          if (interval.from > end || interval.to < start) {
            intervalStart = 0;
            intervalEnd = 0;
            bar.visibility = 'hidden';
          }
          bar.width = Math.ceil(((intervalEnd - intervalStart)
                        / this.msInCell) * this.cellWidth);
          task.push(bar);
        });
        this.tasks.push(task);
      });
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
