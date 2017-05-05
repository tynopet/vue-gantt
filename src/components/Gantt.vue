<template>
  <div class="gantt">
    <div class="left-panel">
      <div class="row spacer">
        <div class="legend" :title="legendHelp">Легенда (?)</div>
        <div class="row fn-wide" v-for="(row, index) in rows" :class="`row${index}`">
          <span class="fn-label">
            <span class="task-name">{{row.name}}</span>
            <span class="task-link"><a :href="row.link"></a>...</span>
          </span>
        </div>
      </div>
    </div>
    <right-panel :startDate="startDate" :endDate="endDate" :values="values"></right-panel>
  </div>
</template>

<script>
  import RightPanel from './RightPanel';

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
        default: '',
      },
    },
    created() {
      const { startDate, endDate, values } = this.rows.reduce((acc, r) => ({
        ...r.values.reduce((d, v) => ({
          startDate: (d.startDate > v.from || !d.startDate) ? v.from : d.startDate,
          endDate: (d.endDate < v.to || !d.endDate) ? v.to : d.endDate,
        }), { startDate: acc.startDate, endDate: acc.endDate }),
        values: [...acc.values, r.values],
      }), { startDate: this.startDate, endDate: this.endDate, values: this.values });
      this.startDate = startDate;
      this.endDate = endDate;
      this.values = values;
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
