module.exports = {
  name: 'scroll-bar',

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

  render: $render(__dirname)
}