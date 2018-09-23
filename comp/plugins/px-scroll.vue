<script>

module.exports = {
  props: {
    direction: { default: 'vertical' }, // vertical / horizontal / both
    breadth: { default: 12 },
    radius: { default: 0 },
    margin: { default: 0 },
  },

  data: () => ({
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    hover: true,
    verticalDrag: null,
    horizontalDrag: null,
  }),
  
  computed: {
    verticalThumb() {
      return {
        top: this.top * 100 + '%',
        height: this.height * 100 + '%',
        borderRadius: this.radius + 'px',
      }
    },
    horizontalThumb() {
      return {
        left: this.left * 100 + '%',
        width: this.width * 100 + '%',
        borderRadius: this.radius + 'px',
      }
    },
  },

  mounted() {
    this.verticalScroll = this.$neatScroll(this.$refs.container, {
      vertical: true,
      callback: () => this.updateVerticalThumb()
    })

    this.horizontalScroll = this.$neatScroll(this.$refs.container, {
      vertical: false,
      callback: () => this.updateHorizontalThumb()
    })
    
    this.updateVerticalThumb()
    this.updateHorizontalThumb()
    if (this.direction !== 'horizontal') {
      this.$el.addEventListener('mousewheel', this.handleVerticalScroll)
    } else {
      this.$el.addEventListener('mousewheel', this.handleHorizontalScroll)
    }

    addEventListener('mouseup', this.handleMouseup)
    addEventListener('mousemove', this.handleMousemove)
  },

  updated() {
    this.updateVerticalThumb()
    this.updateHorizontalThumb()
  },

  beforeDestory() {
    removeEventListener('mouseup', this.handleMouseup)
    removeEventListener('mousemove', this.handleMousemove)
  },

  methods: {
    updateVerticalThumb() {
      this.top = this.$refs.container.scrollTop / this.$refs.container.scrollHeight
      this.height = this.$refs.container.clientHeight / this.$refs.container.scrollHeight
    },
    updateHorizontalThumb() {
      this.left = this.$refs.container.scrollLeft / this.$refs.container.scrollWidth
      this.width = this.$refs.container.clientWidth / this.$refs.container.scrollWidth
    },
    handleVerticalScroll(event) {
      if (!event.shiftKey) {
        this.verticalScroll.scrollByDelta(event.deltaY)
        event.stopPropagation()
        event.preventDefault()
      }
    },
    handleHorizontalScroll(event) {
      if (!event.shiftKey) {
        this.horizontalScroll.scrollByDelta(event.deltaY)
        event.stopPropagation()
        event.preventDefault()
      }
    },
    handleMouseup() {
      this.verticalDrag = null
      this.horizontalDrag = null
    },
    handleMousemove(event) {
      if (this.verticalDrag !== null) {
        event.stopPropagation()
        let delta = (event.clientY - this.verticalDrag) / this.$refs.vertical.clientHeight
        if (this.top + delta < 0) delta = - this.top
        if (this.top + this.height + delta > 1) delta = 1 - this.top - this.height
        this.top += delta
        this.verticalDrag += delta * this.$refs.vertical.clientHeight
        this.verticalScroll.scrollByDelta(delta * this.$refs.container.scrollHeight, false)
      } else if (this.horizontalDrag !== null) {
        event.stopPropagation()
        let delta = (event.clientX - this.horizontalDrag) / this.$refs.horizontal.clientWidth
        if (this.left + delta < 0) delta = - this.left
        if (this.left + this.width + delta > 1) delta = 1 - this.left - this.width
        this.left += delta
        this.horizontalDrag += delta * this.$refs.horizontal.clientWidth
        this.horizontalScroll.scrollByDelta(delta * this.$refs.container.scrollWidth, false)
      }
    },
  }
}

</script>

<template>
  <div class="px-scroll" :class="{ hover }"
    @mouseenter="hover = true" @mouseleave="hover = false">
    <div class="container" ref="container">
      <slot/>
    </div>
    <div v-if="direction !== 'horizontal'" class="scrollbar vertical"
      :style="{ width: breadth + 'px', margin: margin + 'px' }" ref="vertical">
      <div :class="[ 'thumb', { active: verticalDrag !== null, filled: height === 1 } ]"
        :style="verticalThumb" @mousedown.prevent.stop="verticalDrag = $event.clientY"/>
    </div>
    <div v-if="direction !== 'vertical'" class="scrollbar horizontal"
      :style="{ height: breadth + 'px', margin: margin + 'px' }" ref="horizontal">
      <div :class="[ 'thumb', { active: horizontalDrag !== null, filled: width === 1 } ]"
        :style="horizontalThumb" @mousedown.prevent.stop="horizontalDrag = $event.clientX"/>
    </div>
  </div>
</template>

<style lang="scss" scoped>

@import '../colors';

& {
  position: relative;
  height: -webkit-fill-available;
}

& > .container {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-x: hidden;
  overflow-y: hidden;
  position: absolute;
}

& > .scrollbar {
  right: 0;
  bottom: 0;
  position: absolute;
  pointer-events: none;

  &.vertical { top: 0 }
  &.horizontal { left: 0 }

  .thumb {
    width: 100%;
    height: 100%;
    opacity: 0.5;
    cursor: pointer;
    position: absolute;
    pointer-events: auto;
    background-color: $fg4;
    transition: opacity 0.3s ease;

    &:hover, &.active { opacity: 1 }

    &.filled {
      opacity: 0 !important;
      cursor: default;
    }
  }
}

&:not(.hover) > .scrollbar .thumb:not(.active) {
  opacity: 0;
}

</style>
