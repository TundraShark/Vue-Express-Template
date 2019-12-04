<template>
  <div class="about">
    <h1>This is an about page</h1>

    {{ test }}

    <hr>

    <img src="https://tundrafizz.space/img/a.bmp" style="border:1px solid black; width: 300px;">

  </div>
</template>

<script>
import {reactive, toRefs} from "@vue/composition-api";

export default {
  setup(props, {root}) {
    const state = reactive({
      // test: root.Read("yoloTest") || "||||||||||||"
      test: "||||||||||||"
    });

    root.$store.subscribe((mutation) => {
      console.log("========== MUTATION ==========");
      let key = mutation.payload.key;
      let val = mutation.payload.val;
      console.log(mutation);
      console.log(key);
      console.log(val);

      if (key == "yoloTest") {
        state.test = val;
      }
    });

    return {
      ...toRefs(state)
    }
  }
}
</script>

<style scoped lang="scss">
</style>
