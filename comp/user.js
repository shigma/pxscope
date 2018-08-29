module.exports = {
  props: ['height', 'width'],

  beforeCreate() {
    if (!$pixiv.account()) global.PX_VM.switchRoute('login')
  },

  data: () => ({
    info: $pixiv.account(),
    pageMargin: 'auto 0',
  }),

  activated() {
    const user = $pixiv.account()
    if (!user) {
      this.$root.switchRoute('login')
    } else {
      this.info = user
      this.updatePageMargin()
    }
  },

  computed: {
    tableWidth() {
      return (this.width > 800 ? this.width / 2 : 400) + 'px'
    },
  },

  mounted() {
    this.$watch(
      () => this.height - this.$el.offsetHeight,
      this.updatePageMargin
    )
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
    updatePageMargin() {
      if (this.height >= this.$el.offsetHeight + 48) {
        this.pageMargin = 'auto 0'
      } else {
        this.pageMargin = '36px 0 12px'
      }
    }
  }
}