<template>
  <div class="app">
    <link rel="preload" as="script" src="/about"/>
    <div class="navbar">
      <div class="top">
        <router-link tag="div" rel="prefetch" class="nav-element" draggable="false" to="/">Home</router-link>
        <router-link tag="div" rel="prefetch" class="nav-element" draggable="false" to="/about">About</router-link>
      </div>
    </div>
    <div class="window">
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </div>
  </div>
</template>

<script>
// const lazyComponent = () => import("./about.vue");

// export default {
//   setup(props, {root}) {
//     // TODO
//   }
// }
</script>

<style lang="scss">
</style>

<style scoped lang="scss">
</style>
