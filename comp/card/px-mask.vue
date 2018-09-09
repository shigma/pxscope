<script>

module.exports = {
  data: () => ({
    left: 0,
    top: 0,
    scale: 1,
    loading: true,
    dragging: false,
  }),

  computed: {
    imageStyle() {
      return {
        left: this.left + 'px',
        top: this.top + 'px',
        transform: `scale(${this.scale})`,
      }
    },
  },

  mounted() {
    addEventListener('mouseup', this.stopDrag)
    addEventListener('mousemove', this.doDrag)
  },

  beforeDestory() {
    removeEventListener('mouseup', this.stopDrag)
    removeEventListener('mousemove', this.doDrag)
  },

  methods: {
    startDrag(event) {
      this.dragging = true
      this.dragX = event.clientX
      this.dragY = event.clientY
    },
    stopDrag() {
      this.dragging = false
    },
    doDrag(event) {
      if (this.dragging) {
        event.stopPropagation()
        this.left += event.clientX - this.dragX
        this.top += event.clientY - this.dragY
        this.dragX = event.clientX
        this.dragY = event.clientY
      }
    },
    onLoad(event) {
      this.top = (this.$el.parentElement.offsetHeight - event.target.height) / 2
      this.left = (this.$el.parentElement.offsetWidth - event.target.width) / 2
      this.loading = false
    },
    onScroll(event) {
      event.preventDefault()
      event.stopPropagation()
      if (this.scale === 0.5 && event.wheelDelta < 0) return
      const oldScale = this.scale
      this.scale += event.wheelDelta / 900
      const x = event.clientX - this.$el.parentElement.offsetTop
      const y = event.clientY - this.$el.parentElement.offsetLeft
      this.top = (this.top * this.scale + x * (oldScale - this.scale)) / oldScale
      this.left = (this.left * this.scale + y * (oldScale - this.scale)) / oldScale
      if (this.scale < 0.5) this.scale = 0.5
    },
  }
}

</script>


<template>
  <div class="px-mask" @mousewheel.stop.prevent="onScroll">
    <i class="icon-spinner" v-show="loading"/>
    <img :style="imageStyle" @click.stop.right="$download(url)"
      :src="url" @mousedown.stop.prevent="startDrag" @load="onLoad" v-show="!loading"/>
  </div>
</template>

<style lang="scss" scoped>

& {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.6);
}

i.icon-spinner {
  color: #409eff;
  top: 50%;
  left: 0;
  width: 100%;
  position: absolute;
  animation: rotating 1.6s linear infinite;
  text-align: -webkit-center;
  font-size: 60px;
  margin-top: -0.5em;
}

img {
  position: absolute;
}

</style>
