module.exports = {
  mixins: [require('../card')],

  data: () => ({
    collection: {},
  }),
  
  created() {
    const type = this.options.type
    this.getCard(card => {
      card.title = this.$t('discovery.' + type) + this.$t('discovery.illusts')
      card.loading = true
      $pixiv.search('get_illusts', null, type).then((result) => {
        card.loading = false
        this.collection = result
      })
    })
  },

  render: $render(__dirname)
}