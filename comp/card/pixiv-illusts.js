module.exports = {
  props: {
    collection: {
      required: true
    },
    showAuthor: {
      default: true
    },
  },
  inject: ['$card'],
}