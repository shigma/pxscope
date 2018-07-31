const neatScroll = require('neat-scroll')

module.exports = {
  name: 'scroll-view',

  props: {
    width: {
      type: Number,
      default: 16,
    },
    direction: {
      type: String,
      default: 'vertical'
    },
  },

  data: () => ({
    top: 0,
    show: false,
    scrollHeight: 0,
    offsetHeight: 0,
  }),

  mounted() {
    this.target = this.$el.firstElementChild
    const scroll = neatScroll(this.target)

    this.target.addEventListener('mousewheel', (event) => {
      scroll.scrollByDelta(event.deltaY)
      event.preventDefault()
      event.stopPropagation()
    })
  },

  render: $render(__dirname)
}