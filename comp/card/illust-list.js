module.exports = {
  extends: require('.'),

  components: {
    pixivIllusts: require('./pixiv-illusts.vue'),
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