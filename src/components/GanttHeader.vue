<template>
  <div class="gantt-header">
    <div class="row" v-for="(row, idx) in rows">
      <div class="row-item" v-for="(obj, idx) in row" :style="{ width: obj.width + 'px' }">{{ obj.label }}</div>
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
