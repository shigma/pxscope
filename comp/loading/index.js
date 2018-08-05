module.exports = {
  name: 'loading',

  props: ['show'],

  data: () => ({
    text: '',
  }),

  render: $render(__dirname)
}