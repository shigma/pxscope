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
          this.$message.error(this.$t('user.103'))
        } else {
          this.$message.error(error)
        }
        this.$emit('loaded')
      })
    }
  },

  render: $render(__dirname, 'index')
}