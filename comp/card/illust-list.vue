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

  data: () => ({}),

  created() {
    const { type, category, key, data } = this.data
    this.getCard((card) => {
      card.title = category === 'get_illusts'
        ? this.$t('discovery.type.' + type) + this.$t('discovery.category.illust')
        : this.$t('discovery.search') + ': ' + key
      if (data) {
        this.collection = data
        return
      } else {
        this.collection = $pixiv.getCollection('illust')
        card.loading = true
        $pixiv.search(category, key, type).then((result) => {
          card.loading = false
          this.collection = result
        }).catch((error) => console.error(error))
      }
    })
  },
}

</script>