module.exports = {
  name: 'new-card',

  props: ['id', 'height', 'width', 'options'],
  inject: ['commit', 'getCard'],

  created() {
    this.getCard(card => card.title = this.$t('discovery.newPage'))
  },

  render: $render(__dirname)
}