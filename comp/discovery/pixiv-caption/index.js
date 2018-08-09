const {URL} = require('url')
const open = require('opn')

module.exports = {
  props: ['node'],

  methods: {
    navigate(event) {
      if (!event.srcElement.href) return
      const url = new URL(event.srcElement.href)
      if (url.protocol === 'https:' || url.protocol === 'http:') {
        open(url.href)
      } else {
        console.log(url.href)
      }
    }
  },

  render: $render(__dirname)
}