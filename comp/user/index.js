module.exports = {
  name: 'user',

  props: ['height', 'width'],

  beforeCreate() {
    if (!$pixiv.auth) global.PX_VM.switchRoute('login')
  },

  data: () => ({
    info: $pixiv.user,
  }),

  activated() {
    if (!$pixiv.auth) {
      this.$root.switchRoute('login')
    } else {
      this.info = $pixiv.user
    }
  },

  computed: {
    tableWidth() {
      return (this.width > 800 ? this.width / 2 : 400) + 'px'
    },
  },

  methods: {
    editInfo() {
      this.$message.error(this.$t('messages.notSupported'))
    },
    logout() {
      $pixiv.logout()
      localStorage.setItem('auth', null)
      this.$root.switchRoute('login')
    },
  },

  render: $render(__dirname, 'index')
}