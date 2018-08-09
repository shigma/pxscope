module.exports = {
  props: ['id', 'data', 'height', 'width'],
  inject: ['executeMethod'],

  provide() {
    return { $card: this }
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
  },

  methods: {
    getCard(resolve, reject) {
      this.executeMethod('getCard', this.id, resolve, reject)
    },
    removeCard() {
      this.executeMethod('removeCard', this.id)
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