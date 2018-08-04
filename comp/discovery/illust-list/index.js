const neatScroll = require('neat-scroll')

module.exports = {
  name: 'illusts',

  props: ['node'],

  mounted() {
    this.cardScroll = neatScroll(this.$el)
  },

  render: $render(__dirname)
}