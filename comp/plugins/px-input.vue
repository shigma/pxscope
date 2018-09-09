<script>

module.exports = {
  props: {
    prefixIcon: String,
    suffixIcon: String,
    placeholder: String,
    disabled: Boolean,
    validate: Function,
    value: [ String, Number ],
    type: { default: 'text' },
    round: { default: false },
  },

  data: () => ({
    focused: false,
    invalid: false,
  }),

  computed: {
    inputStyle() {
      return {
        paddingLeft: Boolean(this.prefixIcon) + 1 + 'em',
        paddingRight: Boolean(this.suffixIcon) + 1 + 'em',
      }
    },
  },

  methods: {
    onInput(event) {
      this.value = event.target.value
      if (this.validate) {
        this.invalid = !this.validate(this.value)
      }
      this.$emit('input', this.value)
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
  <div class="px-input" :class="{ focused, disabled }">
    <div class="prepend" v-if="$slots.prepend">
      <slot name="prepend"/>
    </div>
    <i v-if="prefixIcon" :class="'icon-' + prefixIcon" class="prefix"/>
    <input :value="value" :type="type" :style="inputStyle" :placeholder="placeholder"
      @input="onInput" @focus="onFocus" @blur="onBlur" @keydown.enter.stop="$emit('enter', $event)"
      :class="{ round, invalid, 'has-append': $slots.append, 'has-prepend': $slots.prepend }"/>
    <i v-if="suffixIcon" :class="'icon-' + suffixIcon" class="suffix"/>
    <div class="append" v-if="$slots.append">
      <slot name="append"/>
    </div>
  </div>
</template>

<style lang="scss" scoped>

@import '../colors';

@mixin Xpend($name, $dir1, $dir2) {
  > input.has-#{$name} {
    border-top-#{$dir1}-radius: 0;
    border-bottom-#{$dir1}-radius: 0;
  }

  > .#{$name} {
    border-top-#{$dir2}-radius: 0;
    border-bottom-#{$dir2}-radius: 0;
    border-#{$dir2}: 0;
  }
}

& {
  height: 2em;
  font-size: 16px;
  position: relative;
  transition: 0.3s ease;
  display: inline-table;
  background-color: inherit;
  width: -webkit-fill-available;

  > i.prefix, > i.suffix {
    color: $fg4;
    top: 50%;
    position: absolute;
    margin-top: -0.5em;
  }

  > i.prefix { left: 10px }
  > i.suffix { right: 10px }

  > input {
    padding: 0;
    width: 100%;
    outline: none;
    font-size: 1em;
    height: inherit;
    display: table-cell;
    border-radius: 0.3em;
    transition: 0.3s ease;
    box-sizing: border-box;
    -webkit-appearance: none;
    background-color: $bg0;
    border: 1px solid $bg4;

    &.round { border-radius: 1em }
    &:hover { border-color: $fg4 }
    &:focus { border-color: $blue }
    &.invalid { border-color: $red !important }
    &::-webkit-input-placeholder { color: $fg4 }
  }

  > .prepend, > .append {
    color: $fg3;
    vertical-align: middle;
    background-color: inherit;
    display: table-cell;
    position: relative;
    border: 1px solid $bg4;
    border-radius: 0.3em;
    padding: 0 20px;
    white-space: nowrap;
  }

  @include Xpend(prepend, left, right);
  @include Xpend(append, right, left);
}

</style>
