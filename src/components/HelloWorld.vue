<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <div>
      <div><input type="button" value="Click Me" v-on:click="doSomething"> <input type="button" value="Change Text" v-on:click="changeText"></div>
      <template v-if="customData">
        <table>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Age</th>
          </tr>
          <template v-for="i of customData">
            <tr>
              <td>{{ i.id   }}</td>
              <td>{{ i.name }}</td>
              <td>{{ i.age  }}</td>
            </tr>
          </template>
        </table>
      </template>
      <template v-else>
        <div>Default text</div>
      </template>
    </div>
    <h3>Installed CLI Plugins</h3>
    <ul>
    </ul>
    <h3>Essential Links</h3>
    <ul>
      <li><a href="https://vuejs.org" target="_blank" rel="noopener">Core Docs</a></li>
      <li><a href="https://forum.vuejs.org" target="_blank" rel="noopener">Forum</a></li>
      <li><a href="https://chat.vuejs.org" target="_blank" rel="noopener">Community Chat</a></li>
      <li><a href="https://twitter.com/vuejs" target="_blank" rel="noopener">Twitter</a></li>
      <li><a href="https://news.vuejs.org" target="_blank" rel="noopener">News</a></li>
    </ul>
    <h3>Ecosystem</h3>
    <ul>
      <li><a href="https://router.vuejs.org" target="_blank" rel="noopener">vue-router</a></li>
      <li><a href="https://vuex.vuejs.org" target="_blank" rel="noopener">vuex</a></li>
      <li><a href="https://github.com/vuejs/vue-devtools#vue-devtools" target="_blank" rel="noopener">vue-devtools</a></li>
      <li><a href="https://vue-loader.vuejs.org" target="_blank" rel="noopener">vue-loader</a></li>
      <li><a href="https://github.com/vuejs/awesome-vue" target="_blank" rel="noopener">awesome-vue</a></li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data: function(){return {"customData": null}},
  methods: {
    doSomething: async () => {
      console.log("=======================================");
      var uri = "https://api-dev.anko.com/api/get_customer";
      var options = {
        "params": {
          "Email": "test@catalysis.com"
        }
      };
      var result = (await axios.get(uri, options))["data"]["data"][0];
      console.log(result);
    },
    changeText: async function() {
      console.log("=======================================");
      var data = (await axios.get("http://localhost/get-data"))["data"];
      var people = data["people"];
      console.log(people);
      this.customData = people;
      for(var i of people){
        console.log(i);
      }
      console.log("=======================================");
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
