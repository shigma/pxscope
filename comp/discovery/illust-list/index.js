const neatScroll = require('neat-scroll')

module.exports = {
  name: 'illusts',

  props: ['id', 'height', 'width', 'options'],
  inject: ['getCard'],

  data: () => ({
    loading: true,
    illusts: [],
  }),
  
  created() {
    const type = this.options.type
    this.getCard(card => {
      card.title = this.$t('discovery.' + type) + this.$t('discovery.illusts')
    })
    $pixiv.search('get_illusts', null, type).then((result) => {
      this.loading = false
      this.illusts = result
    })
  },

  mounted() {
    this.cardScroll = neatScroll(this.$el)
  },

  render: $render(__dirname)
}