<script>

const VueMask = Vue.extend(require('./px-mask.vue'))

module.exports = {
  props: {
    width: Number,
    height: Number,
    maxWidth: Number,
    maxHeight: Number,
    largeUrl: String,
    originalUrl: String,
  },

  methods: {
    handleClick() {
      // new VueMask({
      //   data: {
      //     width: this.width,
      //     height: this.height,
      //     url: this.originalUrl,
      //   }
      // }).$mount(this.$root.$refs.view.appendChild(document.createElement('div')))
    },
  }
}

</script>

<template>
  <div :style="{ width: maxWidth + 'px' }" class="px-illust">
    <img :src="largeUrl" :style="{ 'max-height': maxHeight + 'px' }"
      @click.stop="handleClick"/>
  </div>
</template>

<style lang="scss" scoped>

& {
  display: inline-block;
  &.image-view { display: block }

  img {
    display: block;
    margin: auto;
    max-width: 100%;
  }
}
  
</style>
