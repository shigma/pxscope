// This module serves as a prototype for different types of cards.
// Use `extends: require('./card')` in a card component to get access to it.

module.exports = {
  props: ['id', 'data', 'height', 'width'],

  data: () => ({
    showMenu: false,
    contentWidth: 0,
  }),

  provide() {
    return { $card: this }
  },

  computed: {
    meta() {
      return this.$root.$refs.content.getCard(this.id)
    },
  },

  watch: {
    width() {
      this.updateWidth()
    },
  },

  created() {
    this.meta.vm = this
  },

  mounted() {
    this.updateWidth()
    this.scroll = this.$neatScroll(this.$el)
    this.$el.addEventListener('mousewheel', (event) => {
      if (!event.shiftKey) {
        this.scroll.scrollByDelta(event.deltaY)
        event.stopPropagation()
        event.preventDefault()
      }
    })
  },

  activated() {
    this.updateWidth()
  },

  updated() {
    this.updateWidth()
  },

  methods: {
    updateWidth() {
      this.contentWidth = this.width - 6 * Number(this.$el.scrollHeight - this.$el.offsetHeight > 0)
    },
    getCard(resolve, reject) {
      return this.$root.$refs.content.getCard(this.id, resolve, reject)
    },
    removeCard() {
      this.$root.$refs.content.removeCard(this.id)
    },
    insertCard(type = 'new-card', options = {}) {
      this.getCard((card, index, vm) => {
        vm.insertCard(type, options, index + 1)
      }, (vm) => {
        vm.insertCard(type, options, Infinity)
      })
    },
    getTitle({ type, category, key }) {
      return type === 'walkthrough'
        ? this.$t('discovery.discovery')
        : category === 'general' || type === 'word'
          ? this.$t('discovery.search') + ': ' + key
          : this.$t('discovery.type.' + type) + this.$t('discovery.category.' + category)
    },
  }
}