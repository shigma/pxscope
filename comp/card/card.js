// This module serves as a prototype for different types of cards.
// Use `extends: require('./card')` in a card component to get access to it.

module.exports = {
  props: ['id', 'data', 'height', 'width'],

  provide() {
    return { $card: this }
  },

  computed: {
    discovery() {
      return this.$root.$refs.content
    },
  },

  mounted() {
    this.scroll = this.$neatScroll(this.$el)
    this.$el.addEventListener('mousewheel', (event) => {
      if (!event.shiftKey) {
        this.scroll.scrollByDelta(event.deltaY)
        event.stopPropagation()
        event.preventDefault()
      }
    })
    this.$el.addEventListener('mousedown', (event) => {
      // Prevent from dragging.
      console.log(event)
      // event.preventDefault()
      event.stopPropagation()
    })
  },

  methods: {
    getCard(resolve, reject) {
      this.discovery.getCard(this.id, resolve, reject)
    },
    removeCard() {
      this.discovery.removeCard(this.id)
    },
    insertCard(type = 'new-card', options = {}) {
      this.getCard((card, index, vm) => {
        vm.insertCard(type, options, index + 1)
      }, (vm) => {
        vm.insertCard(type, options, Infinity)
      })
    },
  }
}