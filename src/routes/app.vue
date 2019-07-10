<template>
  <div class="app">
    <div class="navbar">
      <div class="top">
        <router-link tag="div" class="nav-element" draggable="false" to="/">Home</router-link>
        <router-link tag="div" class="nav-element" draggable="false" to="/about">About</router-link>
      </div>
    </div>
    <div class="window">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  data: function(){
    return {
      data: null
    }
  },
  created: async function(){
    this.$store.subscribe((mutation) => {
      if(mutation.type == "gohere"){
        this.discordAuthUrl = mutation.payload;
      } else if(mutation.type = "data"){
        this.data = mutation.payload;
        console.log(this.data);
      }
    });
  },
  methods: {
    JoinDiscordServer: async function() {
      ;
    }
  }
}
</script>

<style lang="scss">
</style>


<style scoped lang="scss">
</style>
