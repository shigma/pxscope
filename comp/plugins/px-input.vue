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
    <input :value="value" type="text" @keydown.enter.stop="$emit('enter', $event)"
      :class="{ round }" :style="inputStyle" :placeholder="placeholder"
      @input="onInput" @change="onChange" @focus="onFocus" @blur="onBlur"/>
    <i v-if="suffixIcon" :class="'icon-' + suffixIcon" class="suffix"/>
  </div>
</template>

<style lang="scss" scoped>

& {
  display: inline-block;
  position: relative;
  transition: 0.3s ease;

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
    font-size: 1em;
    height: inherit;
    line-height: 1em;
    background: inherit;
    border-radius: 0.3em;
    transition: 0.3s ease;
    box-sizing: border-box;
    -webkit-appearance: none;
    border: 1px solid #dcdfe6;
    width: -webkit-fill-available;

    &.round { border-radius: 1em }
    &:hover { border-color: #c0c4cc }
    &:focus { border-color: #409eff }
    &::-webkit-input-placeholder { color: #c0c4cc }
  }
}

</style>
