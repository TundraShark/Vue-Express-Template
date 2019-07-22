<template>
  <div class="home">
    <h1>This is the home page</h1>
    <div class="button" v-on:click="GetData()">Get Data</div>
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
export default {
  data: function() {
    return {
      data: null
    }
  },
  created: async function() {
    this.data = {"testing": "Click on the \"Get Data\" button to get sample data"};

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
    GetData: async function() {
      let data = await axios.get(`${this.API}/data`);
      this.data = data.data;
      console.log(data.data);
    },
    PostData: async function() {
      let data = await axios.post(`${this.API}/data`);
      this.data = data.data;
      console.log(data.data);
    },
    PutData: async function() {
      let data = await axios.put(`${this.API}/data`);
      this.data = data.data;
      console.log(data.data);
    },
    DeleteData: async function() {
      let data = await axios.delete(`${this.API}/data`);
      this.data = data.data;
      console.log(data.data);
    }
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
