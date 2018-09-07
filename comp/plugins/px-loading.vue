<script>

module.exports = {
  props: ['show'],

  data: () => ({
    text: '',
  })
}

</script>

<template>
  <transition name="loading">
    <div v-show="show" class="px-loading">
      <div class="spinner">
        <svg class="circular" viewBox="25 25 50 50">
          <circle class="path" cx="50" cy="50" r="20" fill="none"/>
        </svg>
        <p v-if="text" class="text" v-text="text"/>
      </div>
    </div>
  </transition>
</template>

<style lang="scss" scoped>

& {
  position: absolute;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.9);
  margin: 0;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transition: 0.5s ease;
}

.spinner {
  top: 50%;
  margin-top: -21px;
  width: 100%;
  text-align: center;
  position: absolute;

  i { color: #409EFF }

  .text {
    color: #409EFF;
    margin: 3px 0;
    font-size: 14px;
  }

  .circular {
    height: 42px;
    width: 42px;
    animation: loading-rotate 2s linear infinite
  }

  .path {
    animation: loading-dash 1.5s ease-in-out infinite;
    stroke-dasharray: 90,150;
    stroke-dashoffset: 0;
    stroke-width: 2;stroke: #409EFF;
    stroke-linecap: round
  }
}

.loading-enter, .loading-leave-active { opacity: 0 }

@keyframes loading-rotate {
  100% { transform: rotate(360deg) }
}

@keyframes loading-dash {
  0% { stroke-dasharray: 1, 200; stroke-dashoffset: 0 }
  50% { stroke-dasharray: 90, 150; stroke-dashoffset: -40px }
  100% { stroke-dasharray: 90, 150; stroke-dashoffset: -120px }
}
  
</style>
