<template>
  <div>
    {{realName}}
    <span class="comment" v-if="comment" v-text="comment"/>
  </div>
</template>

<style lang="scss" scoped>
  .comment { color: gray }
</style>

