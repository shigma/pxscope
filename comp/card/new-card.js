module.exports = {
  extends: require('.'),

  created() {
    this.getCard(card => card.title = this.$t('discovery.newPage'))
  }
}