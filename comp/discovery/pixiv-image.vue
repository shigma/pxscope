<template>
  <div class="pixiv-image" :style="{ width: maxWidth + 'px' }">
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
