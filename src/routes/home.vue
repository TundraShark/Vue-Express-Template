<template>
  <div class="home">
    <h1>Template Project</h1>
    <table>
      <tr>
        <td><div class="button" @click="GetData()">Get Data</div></td>
      </tr>
      <tr>
        <td><div class="button" @click="PostData()">Post Data</div></td>
        <td></td>
        <td><input type="text" v-model="postName" placeholder="Name"></td>
        <td><input type="text" v-model="postAge"  placeholder="Age"></td>
      </tr>
      <tr>
        <td><div class="button" @click="PutData()">Put Data</div></td>
        <td><input type="text" v-model="putId"   placeholder="ID"></td>
        <td><input type="text" v-model="putName" placeholder="Name"></td>
        <td><input type="text" v-model="putAge"  placeholder="Age"></td>
      </tr>
      <tr>
        <td><div class="button" @click="DeleteData()">Delete Data</div></td>
        <td><input type="text" v-model="deleteId" placeholder="ID"></td>
      </tr>
    </table>

    {{ test }}

    <table border="1" v-if="data">
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Age</th>
      </tr>
      <template v-for="obj of data">
        <tr>
          <td>{{ obj.id   }}</td>
          <td>{{ obj.name }}</td>
          <td>{{ obj.age  }}</td>
        </tr>
      </template>
    </table>
  </div>
</template>

<script>
import {reactive, toRefs} from "@vue/composition-api";

export default {
  setup(props, {root}) {
    const state = reactive({
      test: root.Read("yoloTest"),
      data: null,
      postName: null,
      postAge: null,
      putId: null,
      putName: null,
      putAge: null,
      deleteId: null,
    });

    const GetData = async () => {
      state.data = await root.Get("data");
      console.log(state.data);
      root.Commit("yoloTest", state.data);
      state.test = root.Read("yoloTest");
    };

    const PostData = async () => {
      let body = {
        name: state.postName,
        age : state.postAge
      };
      await root.Post("data", body);
      await GetData();
    };

    const PutData = async () => {
      let body = {
        id  : state.putId,
        name: state.putName,
        age : state.putAge
      };
      await root.Put("data", body);
      await GetData();
    };

    const DeleteData = async () => {
      let params = {
        id: state.deleteId
      };
      await root.Delete("data", params);
      await GetData();
    };

    return {
      ...toRefs(state),
      GetData,
      PostData,
      PutData,
      DeleteData
    };
  }
}
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
