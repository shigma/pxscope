<script>

module.exports = {
  props: {
    url: String,
    size: Number,
    radius: { default: 0 },
  },

  data: () => ({
    loading: true,
  }),

  computed: {
    spinnerStyle() {
      return {
        'font-size': this.size / 3 + 'px',
        'margin-top': - this.size / 6 + 'px',
      }
    },
  },

  methods: {
    onLoad() {
      this.loading = false
      this.$emit('load')
    },
  }
}

</script>

<template>
  <div class="px-image" :style="{ height: size + 'px', width: size + 'px' }">
    <img :src="url" @load="onLoad" :height="size" :width="size"
      :style="{ borderRadius: radius + 'px' }"/>
    <i class="icon-spinner" v-show="loading" :style="spinnerStyle"/>
    <slot/>
  </div>
</template>

<style lang="scss" scoped>

& {
  margin: 0 auto;
  display: inline-block;
  position: relative;
  text-align: center;
  overflow: hidden;
  cursor: pointer;

  > img {
    top: 0;
    left: 0;
    user-select: none;
    position: absolute;
  }

  > i.icon-spinner {
    color: #409eff;
    top: 50%;
    left: 0;
    width: 100%;
    position: absolute;
    animation: rotating 2s linear infinite;
  }
}
  
</style>
