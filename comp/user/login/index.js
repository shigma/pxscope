module.exports = {
  name: 'user-login',

  props: ['width'],

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
      this.$emit('start-load')
      $pixiv.login(this.username, this.password).then(result => {
        this.$store.commit('saveAccount', {
          id: result.user.id,
          account: result.user.account,
          mail: result.user.mail_address,
          password: this.remember ? this.password : null,
        })
        this.$emit('finish-load')
        this.$root.switchRoute('..')
      }).catch(error => {
        this.$emit('finish-load')
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