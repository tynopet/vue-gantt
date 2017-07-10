<template>
  <div class="footer">
    <input type="range" class="interval" :min="startDate" :max="endDate" :step="step" v-model="range">
    <select v-model="scale">
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
  computed: {
    scale: {
      get() {
        return this.scales[this.selected];
      },
      set(value) {
        const [scale, step] = value.split(' ');
        this.selectedScaleIdx = this.scales.indexOf(value);
        this.$emit('scale-change', { scale, step });
      },
    },
    range: {
      get() {
        return this.period;
      },
      set(value) {
        this.$emit('period-change', value);
      },
    },
  },
};
</script>

<style>
.footer {
  display: flex;
}

.footer .interval {
  flex-grow: 1;
}
</style>
