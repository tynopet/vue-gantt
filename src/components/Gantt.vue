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
  import moment from 'moment';
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
      let startDate = null;
      let endDate = null;
      this.rows.forEach((row) => {
        row.values.forEach((value) => {
          startDate = (startDate > value.from || startDate === null) ? value.from : startDate;
          endDate = (endDate < value.to || endDate === null) ? value.to : endDate;
          /*  eslint-disable no-param-reassign*/
          value.from = moment(value.from);
          value.to = moment(value.to);
          /*  eslint-enable no-param-reassign*/
        });
        row.values.sort((a, b) => a.from - b.from);
        this.values.push(row.values);
      });
      this.startDate = +moment(startDate).startOf('month') || +moment().startOf('month');
      this.endDate = +moment(endDate).endOf('month') || +moment().endOf('month');
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
