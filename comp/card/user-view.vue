<template>
  <div><template v-if="user">
    <pixiv-caption :node="user.user.comment"/>
    <pixiv-illusts :collection="user._illusts" :show-author="false"/>
  </template></div>
</template>

<style lang="scss" scoped>
  
</style>
