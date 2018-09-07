<script>

const { debounce } = require('throttle-debounce')

module.exports = {
  inject: ['$card'],

  props: {
    sizeX: Number,
    sizeY: Number,
    marginX: Number,
    marginY: Number,
    length: Number,
  },

  data: () => ({
    columns: 0,
    marginLeft: 0,
  }),

  computed: {
    height() {
      return this.length * this.itemY - this.marginY
    },
  },

  watch: {
    columns() {
      this.$el.style.transition = '0.3s margin-left ease-in-out'
      this.clearTransition()
      this.updateElements()
    },
  },

  created() {
    this.itemX = this.sizeX + this.marginX
    this.itemY = this.sizeY + this.marginY
    this.$card.$watch('contentWidth', () => {
      this.updateLayout()
    })
  },

  mounted() {
    global.grid = this
    this.updateLayout()
  },

  methods: {
    clearTransition: debounce(300, () => {
      this.$el.style.transition = ''
    }),
    updateLayout() {
      const totalWidth = this.$card.contentWidth + this.marginX
      this.columns = totalWidth / this.itemX << 0
      this.marginLeft = (totalWidth - this.columns * this.itemX) / 2
    },
    updateElements() {
      this.$slots.default.forEach(({ elm }, index) => {
        elm.style.top = (index / this.columns << 0) * this.itemY + 'px'
        elm.style.left = (index % this.columns) * this.itemX + 'px'
        elm.style.position = 'absolute'
      })
    },
  },

  render(createElement) {
    return createElement('transition-group', {
      class: 'px-grid',
      props: {
        tag: 'div',
      },
      style: {
        height: this.height + 'px',
        marginLeft: this.marginLeft + 'px',
      },
      on: {
        beforeEnter(el) {
          console.log(el)
        },
        beforeLeave(el) {
          console.log(el)
        },
      },
    }, this.$slots.default)
  }
}

</script>

<style lang="scss" scoped>

& {
  overflow: hidden;
  position: relative;
  text-align: -webkit-center;
}

</style>
