<script>

module.exports = {
  props: {
    label: String,
  },
}

</script>

<template>
  <div class="setting-item">
    <div class="label" v-text="label"/>
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
    border-bottom: 1px solid $fg3;
  }

  .label {
    flex: 1 1 auto;
    text-decoration: none;
    padding: 0.8em 1em;
    line-height: 1.1em;
    background: none;
    font-size: 16px;
    display: inline-block;
    box-sizing: border-box;
    margin: auto;
  }

  .control {
    display: inline-block;
    padding: 0.8em 1em;
    line-height: 1.1em;
    font-size: 12px;
    text-align: right;
    max-width: 200px;
  }
}

</style>
