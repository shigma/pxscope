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