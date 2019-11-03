<template>
  <div class="app">
    <div class="navbar">
      <div class="top">
        <router-link tag="div" class="nav-element" draggable="false" to="/">Home</router-link>
        <router-link tag="div" class="nav-element" draggable="false" to="/home-2">Home 2</router-link>
        <router-link tag="div" class="nav-element" draggable="false" to="/about">About</router-link>
      </div>
    </div>
    <div class="window">
      <router-view>
        <keep-alive include="home-2">
      </router-view>
        </keep-alive>
    </div>
  </div>
</template>

<script>
export default {
  setup(props, {root}) {
    // TODO
  }
}
</script>

<style lang="scss">
</style>

<style scoped lang="scss">
</style>
