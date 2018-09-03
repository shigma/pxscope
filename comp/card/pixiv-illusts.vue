<script>

module.exports = {
  props: {
    collection: {
      required: true
    },
    showAuthor: {
      default: true
    },
  },
  components: {
    pixivIllustsItem: require('./pixiv-illusts-item.vue'),
  },
}

</script>

<template>
  <div class="illusts">
    <pixiv-illusts-item v-for="(illust, index) in collection.data"
      :key="index" :illust="illust" :show-author="showAuthor"/>
  </div>
</template>

<style lang="scss" scoped>

& {
  text-align: -webkit-center;
}
  
</style>
