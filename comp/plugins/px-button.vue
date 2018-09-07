<script>

module.exports = {
  props: {
    width: Number,
    size: Number,
    icon: String,
    radius: { default: 6 },
    type: { default: 'default' },
    loading: { default: false },
    disabled: { default: false },
  },
}

</script>

<template>
  <button @click.stop="$emit('click', $event)" :disabled="loading || disabled"
    :class="[ 'px-button', type, { disabled, loading } ]" :style="{
      padding: radius + 'px',
      'font-size': size + 'px',
      'border-radius': radius + 'px',
    }">
    <div :style="{ 'min-width': width + 'px' }">
      <i class="icon-loading" v-if="loading"/>
      <i :class="'icon-' + icon" v-else-if="icon"/>
      <slot/>
    </div>
  </button>
</template>

<style lang="scss" scoped>

@mixin variant($modifier, $fg, $bg, $bd) {
  &.#{$modifier} {
    color: $fg;
    background-color: $bg;
    border-color: $bd;

    &:hover, &:focus {
      background-color: mix(#ffffff, $bg, 20%);
      border-color: mix(#ffffff, $bd, 20%);
    }

    &:active {
      background-color: mix(#000000, $bg, 10%);
      border-color: mix(#000000, $bd, 10%);
    }

    &.disabled, &.loading {
      cursor: default;

      &, &:hover, &:focus, &:active {
        color: #ffffff;
        background-color: mix($bg, #ffffff);
        border-color: mix($bd, #ffffff);
      }
    }
  }
}

& {
  line-height: 1em;
  white-space: nowrap;
  cursor: pointer;
  border: 1px solid;
  text-overflow: ellipsis;
  -webkit-appearance: none;
  text-align: center;
  box-sizing: border-box;
  outline: none;
  margin: 0;
  transition: 0.3s;
  user-select: none;
}

@include variant(default, #606266, #ffffff, #dcdfe6);
@include variant(primary, #ffffff, #409eff, #409eff);
@include variant(disabled, #ffffff, #909399, #909399);

& + & { margin-left: 10px }

</style>
