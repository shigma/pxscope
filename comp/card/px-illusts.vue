<script>

module.exports = {
  props: {
    collection: { required: true },
    showAuthor: { default: true },
    showMask: { default: true },
    maxCount: { default: Infinity },
    exclude: { default: null },
  },
  
  computed: {
    illusts() {
      return this.collection.data
        .filter(illust => illust.id !== this.exclude)
        .slice(0, this.maxCount)
    }
  },
}

</script>

<template>
  <div class="illusts">
    <px-illusts-item v-for="(illust, index) in illusts"
      :key="index" :illust="illust" :show-author="showAuthor" :show-mask="showMask"/>
  </div>
</template>

<style lang="scss" scoped>

& {
  text-align: -webkit-center;
}
  
</style>
