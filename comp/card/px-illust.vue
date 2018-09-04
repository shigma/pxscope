<script>

module.exports = {
  props: ['illust', 'showMask', 'size', 'radius'],
  inject: ['$card'],

  components: {
    pxImg: require('./px-img.vue'),
  },

  data: () => ({
    hover: false,
  }),

  mounted() {
    this.$el.addEventListener('mouseenter', () => this.hover = true)
    this.$el.addEventListener('mouseleave', () => this.hover = false)
    this.$el.addEventListener('click', (event) => {
      this.$card.insertCard('illust-view', { illust: this.illust })
      event.stopPropagation()
    })
  }
}

</script>

<template>
  <px-img :size="size" :radius="radius" :url="illust.image_urls.square_medium">
    <transition name="mask">
      <div v-show="hover && showMask" ref="mask">
        <div><i class="icon-view"/>{{ illust.total_view }}</div>
        <div><i class="icon-bookmark"/>{{ illust.total_bookmarks }}</div>
      </div>
    </transition>
  </px-img>
</template>

<style lang="scss" ref="mask">

& {
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;

  div {
    font-size: 20px;
    line-height: 1em;
    font-weight: bold;
    color: #409eff;
    margin: 8px 0;

    i {
      font-size: 18px;
      padding-right: 6px;
    }
  }
}

&.mask-enter, &.mask-leave-to { transform: translateY(100%) }
&.mask-enter-active, &.mask-leave-active { transition: 0.3s ease }
  
</style>
