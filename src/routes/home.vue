<template>
  <div class="home">
    <h1>This is the home page</h1>
    <!-- <div class="button" v-on:click="GetData()">Get Data</div> -->
    <div class="button" @click="GetData">Get Data</div>
    <div class="button" v-on:click="PostData()">Post Data</div>
    <div class="button" v-on:click="PutData()">Put Data</div>
    <div class="button" v-on:click="DeleteData()">Delete Data</div>

    <table border="1">
      <template v-for="(val, key) of data">
        <tr>
          <td>{{ key }}</td>
          <td>{{ val }}</td>
        </tr>
      </template>
    </table>
  </div>
</template>

<script>
import {value} from "vue-function-api";
import Testing as test from "./testing.vue";

export default {
  setup() {
    // console.log(test.default.setup)
    // test.default.Testing();
    console.log(test);

    const data = value([{"a":"b"},{"c":"d"}]);
    // const data = value([{"a":"b"}]);
    // const data = value(["Hello", "World"]);

    const GetData = () => {
      console.log("REEEEEEEEEEEEEEEEEEEEEEEEE");
      Testing();
      // data = await this.Get("data");
      // data = Get("data");
      // console.log(data);
      console.log("REEEEEEEEEEEEEEEEEEEEEEEEE");
    };



    // PostData
    // PutData
    // DeleteData

    return {
      data,
      GetData
    };
  }
}

// export default {
//   data: function() {
//     return {
//       data: []
//     }
//   },
//   created: async function() {
//     this.data = {"testing": "Click on the \"Get Data\" button to get sample data"};
//   },
//   methods: {
//     GetData: async function() {
//       this["data"] = await this.Get("data");
//       console.log(data);
//     },
//     PostData: async function() {
//       let data = await this.Post("data", {"qwe": 123, "asd": 456});
//       console.log(data);
//     },
//     PutData: async function() {
//       let data = await this.Put("data", {"uio": 789, "jkl": 555});
//       console.log(data);
//     },
//     DeleteData: async function() {
//       let data = await this.Delete("data");
//       console.log(data);
//     }
//   }
// }
</script>

<style scoped lang="scss">
.button {
  position: relative;
  width: 200px;
  margin-bottom: 4px;
  border: 1px solid black;
  text-align: center;
  cursor: pointer;
  -moz-user-select: none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
