<template>
  <div class="gantt-header">
    <div class="row" v-for="(row, idx) in rows" :key="idx">
      <div class="row-item" @click="$emit('header-click', obj)" v-for="(obj, idx) in row" :key="idx" :style="{ width: obj.width + 'px' }">
        {{ obj.label }}
      </div>
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
  flex-shrink: 0;
  border-top: 1px solid #ddd;
  border-right: 1px solid #ddd;
}

.gantt-header .row {
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start;
  height: 24px;
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
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}
</style>
