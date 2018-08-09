<template>
  <div v-html="node" @click.prevent="navigate" class="pixiv-caption"/>
</template>

<style lang="scss" scoped>

  & {
    user-select: auto;
    padding: 8px;
  }
  
</style>
