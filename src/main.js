import Vue from "vue";
import Vuex from "vuex";
import Router from "vue-router";
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

// Define basic functions that allow easy usage of reading and writing from the data store
Vue.mixin({
  methods: {
    Read : function(key     ){return this.$store.state[key]},
    Write: function(key, val){this.$store.commit(key, val)}
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
