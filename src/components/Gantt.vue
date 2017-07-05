<template>
  <div class="gantt">
    <div class="left-panel">
      <div class="row spacer">
        <div class="legend" :title="legendHelp">Легенда (?)</div>
        <div class="row fn-wide" v-for="(row, index) in rows" :class="`row${index}`" :key="index">
          <span class="fn-label">
            <span class="task-name">{{row.name}}</span>
            <span class="task-link">
              <a :href="row.link"></a>...</span>
          </span>
        </div>
      </div>
    </div>
    <right-panel :startDate="startDate" :endDate="endDate" :values="values"></right-panel>
  </div>
</template>

<script>
import parse from 'date-fns/parse';
import min from 'date-fns/min';
import max from 'date-fns/max';
import RightPanel from './RightPanel';

const transformInputvalues = rows => rows.reduce((acc, row) => {
  const dates = row.values.reduce((r, { from, to }) => ({
    startDate: r.from ? min(r.from, parse(from)) : parse(from),
    endDate: r.to ? max(r.to, parse(to)) : parse(to),
  }), {});
  return {
    startDate: acc.startDate ? min(acc.startDate, dates.startDate) : dates.startDate,
    endDate: acc.endDate ? max(acc.endDate, dates.endDate) : dates.endDate,
    values: [...acc.values, row.values],
  };
}, { values: [] });

export default {
  components: {
    RightPanel,
  },
  props: {
    rows: {
      type: Array,
      required: true,
    },
    legendHelp: {
      type: String,
      required: true,
    },
  },
  created() {
    const { startDate, endDate, values } = transformInputvalues(this.rows);
    this.startDate = startDate;
    this.endDate = endDate;
    this.values = values.map(value => value.sort((a, b) => a.from - b.from));
  },
  data() {
    return {
      startDate: null,
      endDate: null,
      values: [],
    };
  },
};
</script>

<style>
.gantt {
  width: 100%;
  height: 300px;
  display: flex;
}

.gantt .row {
  line-height: 24px;
  box-sizing: border-box;
  cursor: pointer;
  height: 24px;
  margin: 0;
}

.gantt .left-panel {
  flex-shrink: 0;
  width: 225px;
  height: calc(100% + 100px);
  overflow: hidden;
  border-right: 1px solid #DDD;
  position: relative;
  z-index: 20;
}

.gantt .left-panel .spacer {
  height: 72px;
  width: 100%;
  background-color: #f6f6f6;
}

.gantt .left-panel .legend {
  width: 100%;
  height: 100%;
  text-align: center;
}

.gantt .left-panel .fn-wide {
  width: 100%;
}
</style>
