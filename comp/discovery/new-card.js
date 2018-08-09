module.exports = {
  mixins: [
    require('./card')
  ],

  created() {
    this.getCard(card => card.title = this.$t('discovery.newPage'))
  }
}