<script>

module.exports = {
  props: {
    value: Boolean,
    label: String,
    disabled: Boolean,
    size: { default: 14 },
  },

  model: {
    prop: 'value',
    event: 'change',
  },

  data: () => ({
    focused: false,
  }),

  methods: {
    onFocus(event) {
      this.focused = true
      this.$emit('focus', event)
    },
    onBlur(event) {
      this.focused = false
      this.$emit('blur', event)
    },
  },
}

</script>

<template>
  <label class="px-checkbox" :class="{ focused, disabled, checked: value }"
    :style="{ fontSize: size + 'px' }">
    <span class="checkbox">
      <span class="inner"></span>
      <input type="checkbox" :disabled="disabled" :value="label" v-model="value"
        @change="$emit('change', $event.target.checked)" @focus="onFocus" @blur="onBlur">
    </span>
    <span class="label" v-if="$slots.default || label">
      <slot/>
      <template v-if="!$slots.default">{{ label }}</template>
    </span>
  </label>
</template>

<style lang="scss" scoped>

& {
  color: #606266;
  cursor: pointer;
  user-select: none;
  display: inline-block;
  transition: 0.3s ease;
  line-height: 1em;

  > .checkbox {
    outline: 0;
    line-height: 1em;
    vertical-align: sub;

    > span {
      position: relative;
      display: inline-block;
      box-sizing: border-box;
      transition: 0.3s ease;
      background-color: #ffffff;
      border: 0.07em solid #dcdfe6;
      border-radius: 2px;
      width: 1em;
      height: 1em;
    }

    > span::after {
      content: "";
      box-sizing: content-box;
      border: 0.07em solid #fff;
      border-left: 0;
      border-top: 0;
      height: 0.5em;
      left: 0.29em;
      top: 0.08em;
      width: 0.21em;
      position: absolute;
      transform: rotate(45deg) scaleY(0);
      transition: transform .15s ease-in .05s;
      transform-origin: center;
    }

    > input {
      position: absolute;
      opacity: 0;
      outline: 0;
      margin: 0;
      width: 0;
      height: 0;
      z-index: -1;
    }
  }

  > .label {
    line-height: 1em;
    margin-left: 4px;
    vertical-align: middle;
  }

  &.focused > .checkbox > span {
    border-color: #409EFF;
  }

  &.checked > .checkbox > span {
    background-color: #409EFF;
    border-color: #409EFF;

    &::after { transform: rotate(45deg) scaleY(1) }
  }
  
  &.checked { color: #409EFF }
}

</style>
