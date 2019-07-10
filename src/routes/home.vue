<template>
  <div class="home">
    <h1>This is the home page</h1>
  </div>
</template>

<script>
export default {
  data: function(){
    return {
      data: null
    }
  },
  created: async function() {
    this.$store.subscribe((mutation) => {
      if(mutation.type == "gohere") {
        this.discordAuthUrl = mutation.payload;
      } else if(mutation.type = "data") {
        this.data = mutation.payload;
        console.log(this.data);
      }
    });
  },
  methods: {
    MyFunction: async function() {

    }
  }
}
</script>

<style scoped lang="scss">
</style>
