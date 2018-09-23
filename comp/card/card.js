// This module serves as a prototype for different types of cards.
// Use `extends: require('./card')` in a card component to get access to it.

module.exports = {
  props: ['card', 'dragged', 'height'],

  components: {
    pxCard: require('./px-card.vue'),
  },

  provide() {
    return { $card: this }
  },

  computed: {
    width() {
      return this.card.width
    },
    meta() {
      return this.$root.$refs.content.getCard(this.card.id)
    },
  },

  created() {
    this.meta.vm = this
  },

  methods: {
    getCard(resolve, reject) {
      return this.$root.$refs.content.getCard(this.card.id, resolve, reject)
    },
    removeCard() {
      this.$root.$refs.content.removeCard(this.card.id)
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