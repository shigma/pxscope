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
    timeout: {
      get() {
        return this.settings.timeout
      },
      set(value) {
        if (!value.match(/^\d+(\.\d+)?$/)) return
        this.settings.timeout = Number(value)
        $pixiv.timeout = Number(value) * 1000
      }
    },
    language: {
      get() {
        return this.$i18n.locale
      },
      set(value) {
        this.$i18n.locale = value
        $pixiv.language = value
      }
    }
  },

  render: $render(__dirname, 'index')
}