<template>
  <div class="footer">
    <input type="range" class="interval" :min="startDate" :max="endDate" :step="step" :value="period" @input="$emit('period-change', $event)">
    <select :value="scales[selected]" @change="$emit('scale-change', $event)">
      <option v-for="scale in scales" :key="scale">{{ scale }}</option>
    </select>
  </div>
</template>

<script>
export default {
  props: {
    startDate: {
      type: Number,
      required: true,
    },
    endDate: {
      type: Number,
      required: true,
    },
    step: {
      type: Number,
      required: true,
    },
    scales: {
      type: Array,
      required: true,
    },
    period: {
      type: Number,
      required: true,
    },
    selected: {
      type: Number,
      required: true,
    },
  },
};
</script>

<style>
.footer {
  display: flex;
  border: 1px solid #DDD;
  border-top: none;
  box-sizing: border-box;
}

.footer .interval {
  flex-grow: 1;
}
</style>
