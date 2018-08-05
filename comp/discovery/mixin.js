const neatScroll = require('neat-scroll')

module.exports = {
  props: ['id', 'height', 'width', 'options'],
  inject: ['getCard', 'commit'],

  mounted() {
    this.scroll = neatScroll(this.$el)
    this.$el.addEventListener('mousewheel', (event) => {
      this.scroll.scrollByDelta(event.deltaY)
      event.stopPropagation()
      event.preventDefault()
    })
  },
}