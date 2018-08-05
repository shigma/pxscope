module.exports = {
  name: 'new-card',

  mixins: [require('../mixin')],

  created() {
    this.getCard(card => card.title = this.$t('discovery.newPage'))
  },

  render: $render(__dirname)
}