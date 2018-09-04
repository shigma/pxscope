<template>
  <div>
    <px-illusts :collection="collection"/>
  </div>
</template>

<style lang="scss" scoped>
  
</style>

<script>

module.exports = {
  extends: require('./card'),

  components: {
    pxIllusts: require('./px-illusts.vue'),
  },

  data: () => ({
    collection: $pixiv.getCollection('illust'),
  }),

  created() {
    const { type, category, key } = this.data
    this.getCard((card) => {
      card.title = category === 'get_illusts'
        ? this.$t('discovery.' + type) + this.$t('discovery.illusts')
        : this.$t('discovery.search') + ': ' + key
      card.loading = true
      $pixiv.search(category, key, type).then((result) => {
        card.loading = false
        this.collection = result
      })
    })
  },
}

</script>