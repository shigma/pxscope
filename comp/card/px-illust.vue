<template>
  <div :style="{ width: maxWidth + 'px' }" class="px-illust">
    <img :src="largeUrl" :style="{ 'max-height': maxHeight + 'px' }"/>
  </div>
</template>

<style lang="scss" scoped>

& {
  display: inline-block;
  &.image-view { display: block }

  img {
    display: block;
    margin: auto;
    max-width: 100%;
  }
}
  
</style>

<script>

module.exports = {
  props: ['maxWidth', 'maxHeight', 'largeUrl', 'originalUrl']
}

</script>