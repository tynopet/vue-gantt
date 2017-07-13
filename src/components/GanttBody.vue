 <template>
  <div class="ganttBody">
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
.ganttBody {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  flex-shrink: 0;
  overflow: hidden;
  background-image: url('/static/grid.png');
  background-repeat: repeat;
}

.ganttBody .task {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
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
  min-width: 12px;
  height: 20px;
}
</style>
