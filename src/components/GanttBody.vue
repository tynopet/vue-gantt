 <template>
  <div class="vue-gantt-body">
    <div class="task" v-for="(task, idx) in tasks" :key="idx">
      <div class="interval" v-for="({ display, desc, color, width, offset }, idx) in task" :key="idx" :title="desc" v-show="display" :style="{
                                    'background-color': color,
                                    width: width + 'px',
                                    'margin-left': offset + 'px',
                                  }">
        {{desc}}
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
.vue-gantt-body {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  flex-shrink: 0;
  overflow: hidden;
  background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAABlBMVEXl5eX////ixexJAAAAFUlEQVQoz2NgxA4YGEYlRiUIS+ACAIk/AhIVOVcSAAAAAElFTkSuQmCC');
  background-repeat: repeat;
}

.vue-gantt-body .task {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  line-height: 24px;
  height: 24px;
  flex-shrink: 0;
  overflow: hidden;
}

.vue-gantt-body .task .interval {
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 8px;
  height: 20px;
}
</style>
