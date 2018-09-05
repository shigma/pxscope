<script>

module.exports = {
  props: {
    prefixIcon: String,
    suffixIcon: String,
    placeholder: String,
    tabindex: String,
    value: String,
    size: { default: 16 },
    padding: { default: 8 },
    round: { default: false },
  },

  data: () => ({
    focused: false,
  }),

  computed: {
    inputStyle() {
      return {
        paddingLeft: Boolean(this.prefixIcon) * this.size + this.padding * 2 + 'px',
        paddingRight: Boolean(this.suffixIcon) * this.size + this.padding * 2 + 'px',
      }
    },
  },

  methods: {
    onInput(event) {
      this.value = event.target.value
      this.$emit('input', this.value)
    },
    onChange(event) {
      this.$emit('change', event.target.value)
    },
    onFocus(event) {
      this.focused = true
      this.$emit('focus', event)
    },
    onBlur(event) {
      this.focused = false
      this.$emit('blur', event)
    },
  }
}

</script>

<template>
  <div :style="{ fontSize: size + 'px', height: size + padding * 2 + 'px' }" class="px-input">
    <i v-if="prefixIcon" :class="'icon-' + prefixIcon" class="prefix"/>
    <input v-bind="$attrs" :value="value" type="text"
      :class="{ round }" :style="inputStyle"
      @input="onInput" @change="onChange" @focus="onFocus" @blur="onBlur"/>
    <i v-if="suffixIcon" :class="'icon-' + suffixIcon" class="suffix"/>
  </div>
</template>

<style lang="scss" scoped>

& {
  display: inline-block;
  position: relative;

  i {
    position: absolute;
    color: #c0c4cc;
    top: 50%;
    margin-top: -0.5em;

    &.prefix { left: 10px }
    &.suffix { right: 10px }
  }

  input {
    padding: 0;
    outline: none;
    height: inherit;
    transition: 0.3s;
    background: inherit;
    font-size: 1em;
    box-sizing: border-box;
    -webkit-appearance: none;
    width: -webkit-fill-available;
    border: 1px solid #dcdfe6;
    border-radius: 0.3em;
    line-height: 1em;

    &.round { border-radius: 1em }
    &:hover { border-color: #c0c4cc }
    &:focus { border-color: #409eff }
  }
}

</style>
