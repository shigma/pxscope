<script>

module.exports = {
  props: {
    direction: { default: 'vertical' }, // vertical / horizontal / both
  },

  mounted() {
    this.scroll = this.$neatScroll(this.$el, {
      vertical: this.direction !== 'horizontal',
    })
    this.$el.addEventListener('mousewheel', (event) => {
      if (!event.shiftKey) {
        this.scroll.scrollByDelta(event.deltaY)
        event.stopPropagation()
        event.preventDefault()
      }
    })
  },
}

</script>

<template>
  <div class="px-scroll">
    <slot/>
  </div>
</template>

<style lang="scss" scoped>

& {
  overflow-x: hidden;
  overflow-y: hidden;
}

</style>
