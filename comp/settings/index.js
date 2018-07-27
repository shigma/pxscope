module.exports = {
  name: 'settings',

  props: ['height', 'width'],
  inject: ['library'],

  computed: {
    settings() {
      return this.$store.state.settings
    },
    itemWidth() {
      return this.width > 800 ? this.width / 2 : 400
    },
  },

  ...$render(__dirname, 'index')
}