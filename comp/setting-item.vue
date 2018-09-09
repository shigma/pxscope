<script>

module.exports = {
  props: {
    label: String,
    caption: String,
  },
}

</script>

<template>
  <div class="setting-item">
    <div class="label">
      {{ label }}
      <div class="caption" v-if="caption" v-text="caption"/>
    </div>
    <div class="control">
      <slot/>
    </div>
  </div>
</template>

<style lang="scss" scoped>

@import './colors';

& {
  padding: 0;
  cursor: default;
  display: -webkit-flex;
  -webkit-user-select: none;

  &:not(:last-child) {
    border-bottom: 1px solid $bg4;
  }

  .label {
    color: $fg1;
    flex: 1 1 auto;
    text-decoration: none;
    padding: 0.8em 1em;
    line-height: 1em;
    background: none;
    font-size: 16px;
    display: inline-block;
    box-sizing: border-box;
    margin: auto;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;

    div.caption {
      color: $fg2;
      font-size: 12px;
      padding: 6px 0 0;
      line-height: 16px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }

  .control {
    display: flex;
    padding: 0.8em 1em;
    line-height: 1em;
    font-size: 12px;
    text-align: right;
    max-width: 200px;
    flex-direction: column;
    justify-content: center;
  }
}

</style>
