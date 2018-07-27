module.exports = {
  name: 'settings',

  data: () => ({}),

  computed: {
    itemWidth() {
      return this.width > 800 ? this.width / 2 : 400
    }
  },

  props: ['height', 'width'],
  ...$render(__dirname, 'index')
}