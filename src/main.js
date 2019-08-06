import Vue from "vue";
import Vuex from "vuex";
import Router from "vue-router";
import Axios from "axios";
import App from "./routes/app.vue";
import Home from "./routes/home.vue";
import About from "./routes/about.vue";

Vue.use(Router);
Vue.use(Vuex);

// Library: Thousands seperator for numbers
Vue.filter("formatNumber", function(value){return require("numeral")(value).format("0,0");});

const router = new Router({
  mode: "history",
  // mode: "abstract",
  routes: [{
    path: "/",
    component: Home
   },{
    path: "/about",
    component: About
  }]
});

// Everything defined in Vue.mixin will be created in every Vue instance, effectively making these global methods and variables
Vue.mixin({
  // Define basic functions that allow easy usage of reading and writing from the data store
  methods: {
    Read : function(key     ){return this.$store.state[key]},
    Write: function(key, val){this.$store.commit(key, val)},

    Get: async function(endpoint) {
      let response = await this.Axios.get(`${process.env.VUE_APP_BACKEND}/${endpoint}`, {withCredentials: true});
      return response["data"];
    },
    Post: async function(endpoint, body = {}) {
      let response = await this.Axios.post(`${process.env.VUE_APP_BACKEND}/${endpoint}`, body, {withCredentials: true});
      return response["data"];
    },
    Put: async function(endpoint, body = {}) {
      let response = await this.Axios.put(`${process.env.VUE_APP_BACKEND}/${endpoint}`, body, {withCredentials: true});
      return response["data"];
    },
    Delete: async function(endpoint) {
      let response = await this.Axios.delete(`${process.env.VUE_APP_BACKEND}/${endpoint}`, {withCredentials: true});
      return response["data"];
    }
  },
  created: function() {
    this.API = process.env.VUE_APP_BACKEND;
    this.Axios = Axios;
  }
});

// Define data that will be used across the entire application
const store = new Vuex.Store({
  state: {
    // data: {}
  },
  mutations: {
    data   (state, a) {state.data   = a},
    gohere (state, a) {state.gohere = a}
  }
});

// Create the application and mount it onto #app
new Vue({
  store : store,
  router: router,
  render: (a) => a(App),
}).$mount("#app");
