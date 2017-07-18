<template>
  <div class="vue-gantt-legend">
    <div class="title" :title="legendHelp">Легенда (?)</div>
    <div class="task" v-for="(row, index) in rows" :key="index" @click="$emit('task-clicked', row.start)">
      <span class="task-name">{{row.name}}</span>
      <span class="task-link">
        <a :href="row.link">...</a>
      </span>
    </div>
  </div>
</template>

<script>
export default {
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
};

</script>

<style scoped>
.vue-gantt-legend {
  flex-shrink: 0;
  width: 225px;
  overflow: hidden;
  box-sizing: border-box;
  border: 1px solid #DDD;
  border-bottom: none;
  position: relative;
  z-index: 20;
}

.vue-gantt-legend .title {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 72px;
  box-sizing: border-box;
  border-bottom: 1px solid #DDD;
}

.vue-gantt-legend .task {
  line-height: 24px;
  box-sizing: border-box;
  border-bottom: 1px solid #DDD;
  cursor: pointer;
  height: 24px;
  margin: 0;
  width: 100%;
}
</style>
