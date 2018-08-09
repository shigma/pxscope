<script></script>

<template>
  <div>
    <div class="input" :style="{width: itemWidth}">
      <div class="label">{{ $t('user.username') }}</div>
      <el-input v-model="username" :placeholder="$t('user.enterUsername')"/>
    </div>
    <div class="input" :style="{width: itemWidth}">
      <div class="label">{{ $t('user.password') }}</div>
      <el-input v-model="password" :placeholder="$t('user.enterPassword')" type="password"/>
    </div>
    <el-checkbox v-model="remember" size="medium">{{ $t('user.remember') }}</el-checkbox>
    <div class="buttons">
      <button @click.stop="login">{{ $t('user.login') }}</button>
      <button @click.stop="register">{{ $t('user.register') }}</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>

  & {
    margin: auto;
    top: 0;
    bottom: 0;
    height: fit-content;
    display: flex;
    flex-direction: column;
  }

  .input {
    display: -webkit-flex;
    margin: 12px auto 0;

    .label {
      font-size: 16px;
      width: 80px;
      flex: 1 1 auto;
      margin: auto 8px;
      text-align: center;

      & + div { flex: 2 1 auto }
    }
  }

  .buttons {
    margin-top: 12px;
    display: flex;
    justify-content: center;

    button {
      display: inline-flex;
      margin: 0 8px;
      line-height: 1;
      cursor: pointer;
      -webkit-appearance: none;
      text-align: center;
      box-sizing: border-box;
      outline: 0;
      transition: 0.5s;
      padding: 10px 20px;
      font-size: 14px;
      border-radius: 4px;
    }
  }

  .el-checkbox {
    height: 20px;
    margin: 16px auto;
    display: inline-flex;

    .el-checkbox__inner {
      width: 16px;
      height: 16px;
      border-radius: 4px;
     
      &::after {
        border-width: 2px;
        height: 10px;
        left: 3px;
        top: 0;
        width: 5px;
      }
    }

    .el-checkbox__label {
      font-size: 16px;
      line-height: 20px;
      vertical-align: middle;
      transition: 0.5s ease;
    }
  }

</style>
