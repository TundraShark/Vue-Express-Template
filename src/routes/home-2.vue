<template>
  <div class="home-2">
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
import {ref} from "@vue/composition-api";

export default {
  setup(props, {root}) {
    const data     = ref(null);
    const postName = ref(null);
    const postAge  = ref(null);
    const putId    = ref(null);
    const putName  = ref(null);
    const putAge   = ref(null);
    const deleteId = ref(null);

    const GetData = async () => {
      data.value = await root.Get("data");
    };

    const PostData = async () => {
      let body = {
        name: postName,
        age : postAge
      };
      await root.Post("data", body);
      await GetData();
    };

    const PutData = async () => {
      let body = {
        id  : putId,
        name: putName,
        age : putAge
      };
      await root.Put("data", body);
      await GetData();
    };

    const DeleteData = async () => {
      let params = {
        id: deleteId
      };
      await root.Delete("data", params);
      await GetData();
    };

    return {
      data, postName, postAge, putId, putName, putAge, deleteId,
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
