<template>
  <div>
    {{realName}}
    <span class="comment" v-if="comment" v-text="comment"/>
  </div>
</template>

<style lang="scss" scoped>

.comment { color: gray }

</style>

<script>

module.exports = {
  props: ['name'],

  created() {
    const match = this.name.match(/@.+$/)
    if (match) {
      this.realName = this.name.slice(0, match.index)
      this.comment = match[0]
    } else {
      this.realName = this.name
      this.comment = ''
    }
  }
}

</script>