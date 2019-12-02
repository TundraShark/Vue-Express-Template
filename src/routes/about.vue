<template>
  <div class="about">
    <h1>This is an about page</h1>

    {{ test }}
  </div>
</template>

<script>
import {reactive, toRefs} from "@vue/composition-api";

export default {
  setup(props, {root}) {
    const state = reactive({
      test: root.Read("yoloTest") || "||||||||||||"
    });

    root.$store.subscribe((mutation) => {
      let key = mutation.payload.key;
      let val = mutation.payload.val;

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
