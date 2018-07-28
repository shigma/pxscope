module.exports = {
  name: 'user-login',

  props: ['height', 'width'],

  data: () => ({
    username: '',
    password: '',
    remember: true,
  }),

  computed: {
    itemWidth() {
      return (this.width > 900 ? this.width / 3 : 300) + 'px'
    },
  },

  methods: {
    login() {
      this.$emit('loading')
      $pixiv.login(this.username, this.password).then(result => {
        console.log(result)
        this.$emit('loaded')
        this.$root.switchRoute('..')
      }).catch(error => {
        if (error.startsWith('103')) {
          this.$message.error(this.$t('messages.wrongPassword'))
        } else if (error.startsWith('connect ETIMEDOUT')) {
          this.$message.error(this.$t('messages.connectTimeout'))
        } else if (error.startsWith('access_denied')) {
          this.$message.error(this.$t('messages.accessDenied'))
        } else {
          this.$message.error(error)
          console.error(error)
        }
        this.$emit('loaded')
      })
    },
    register() {
      this.$message.error(this.$t('messages.notSupported'))
    }
  },

  render: $render(__dirname, 'index')
}