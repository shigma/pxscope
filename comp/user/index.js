module.exports = {
  name: 'user',

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
    topHeight() {
      return (this.height - 188) / 2 + 'px'
    }
  },

  ...$render(__dirname, 'index')
}