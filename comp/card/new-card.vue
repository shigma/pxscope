<template>
  <div>
    <button class="menu" v-text="$t('discovery.recommended') + $t('discovery.illusts')"
      @click.stop="insertCard('illust-list', { type: 'recommended', category: 'get_illusts' })"/>
    <button class="menu" v-text="$t('discovery.new') + $t('discovery.illusts')"
      @click.stop="insertCard('illust-list', { type: 'new', category: 'get_illusts' })"/>
    <button class="menu" v-text="$t('discovery.follow') + $t('discovery.illusts')"
      @click.stop="insertCard('illust-list', { type: 'follow', category: 'get_illusts' })"/>
    <button class="menu" v-text="$t('discovery.recommended') + $t('discovery.users')"
      @click.stop="insertCard('user-list', { type: 'recommended', category: 'get_users' })"/>
  </div>
</template>

<style lang="scss" scoped>

  button.menu {
    width: 100%;
    font-size: 16px;
    text-align: left;
    padding: 12px 16px;
    line-height: 1em;
  }
  
</style>
