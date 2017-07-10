<template>
  <div class="ganttBody">
    <div class="task" v-for="(task, idx) in tasks" :key="idx">
      <div class="interval" v-for="interval in task" :key="interval" v-show="interval.display" :style="{ 'background-color': interval.color, width: interval.width + 'px', 'margin-left': interval.offset + 'px', display: interval.display }">
        {{interval.desc}}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    tasks: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style>
.ganttBody {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  flex-shrink: 0;
  overflow: hidden;
  border-bottom: 1px solid #DDD;
  border-right: 1px solid #DDD;
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
