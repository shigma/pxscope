module.exports = {
  name: 'user-login',

  props: ['height', 'width'],

  data: () => ({
    username: '',
    password: '',
    remember: true,
  }),

  created() {
    const auth = this.$loadFromStorage('auth')
    if (auth.access_token) {
      $pixiv.auth = auth
      this.$root.switchRoute('..')
    }
  },

  computed: {
    itemWidth() {
      return (this.width > 900 ? this.width / 3 : 300) + 'px'
    },
  },

  mounted() {
    addEventListener('beforeunload', () => {
      if (this.remember && $pixiv.auth) {
        localStorage.setItem('auth', JSON.stringify($pixiv.auth))
      }
    })
  },

  methods: {
    login() {
      this.$emit('load-start')
      $pixiv.login(this.username, this.password).then(result => {
        this.$store.commit('saveAccount', {
          id: result.user.id,
          account: result.user.account,
          mail: result.user.mail_address,
          password: this.remember ? this.password : null,
        })
        this.$emit('load-end')
        this.$root.switchRoute('..')
      }).catch(error => {
        this.$emit('load-end')
        if (error.startsWith('103')) {
          this.$message.error(this.$t('messages.wrongPassword'))
        } else if (error.startsWith('connect ETIMEDOUT') || error === 'socket hang up') {
          this.$message.error(this.$t('messages.connectTimeout'))
        } else if (error.startsWith('connect EHOSTUNREACH')) {
          this.$message.error(this.$t('messages.noRouteToHost'))
        } else if (error === 'access_denied') {
          this.$message.error(this.$t('messages.accessDenied'))
        } else {
          this.$message.error(error)
          console.error(error)
          this.$pushError('Unknown error message', error)
        }
      })
    },
    register() {
      this.$message.error(this.$t('messages.notSupported'))
    }
  },

  render: $render(__dirname, 'index')
}