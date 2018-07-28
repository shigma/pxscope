module.exports = {
  name: 'settings',

  props: ['width'],
  inject: ['library'],

  computed: {
    settings() {
      return this.$store.state.settings
    },
    itemWidth() {
      return (this.width > 800 ? this.width / 2 : 400) + 'px'
    },
  },

  render: $render(__dirname, 'index')
}