module.exports = {
  mixins: [
    require('./card')
  ],

  data: () => ({
    collection: $pixiv.createCollection('Illust'),
  }),

  created() {
    const type = this.data.type
    this.getCard((card) => {
      card.title = this.$t('discovery.' + type) + this.$t('discovery.illusts')
      card.loading = true
      $pixiv.search('get_illusts', null, type).then((result) => {
        card.loading = false
        this.collection = result
      })
    })
  }
}