<template>
  <div v-html="node" @click.prevent="navigate" class="pixiv-caption"/>
</template>

<style lang="scss" scoped>

& {
  user-select: auto;
  padding: 8px;
}
  
</style>

<script>

const { URL } = require('url')
const open = require('opn')

module.exports = {
  props: ['node'],
  inject: ['$card'],

  methods: {
    navigate(event) {
      if (!event.srcElement.href) return
      const url = new URL(event.srcElement.href)
      if (url.protocol === 'https:' || url.protocol === 'http:') {
        open(url.href)
      } else if (url.protocol === 'pixiv:') {
        if (url.host === 'illusts') {
          this.$card.insertCard('illust-view', { id: url.pathname.slice(1) })
        } else if (url.host === 'users') {
          this.$card.insertCard('user-view', { id: url.pathname.slice(1) })
        } else {
          console.log(url.href)
        }
      }
    }
  }
}

</script>