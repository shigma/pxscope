module.exports = {
  name: 'user-login',

  props: ['height', 'width'],

  data: () => ({
    username: '',
    password: '',
    remember: true
  }),

  computed: {
    itemWidth() {
      return (this.width > 900 ? this.width / 3 : 300) + 'px'
    },
  },

  render: $render(__dirname, 'index')
}