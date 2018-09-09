<template>
  <div class="px-button-group">
    <slot/>
  </div>
</template>

<style lang="scss" scoped>

& {
  display: inline-block;
  vertical-align: middle;
}

&::before, &::after {
  display: table;
  content: "";
}

&::after { clear: both }

& > .px-button {
  float: left;
  position: relative;

  + & { margin-left: 0 }

  &:first-child {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  &:last-child {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  
  &:first-child:last-child {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  &:not(:first-child):not(:last-child) {
    border-radius: 0;
  }

  &:not(:last-child) {
    margin-right: -1px;
  }
}

</style>
