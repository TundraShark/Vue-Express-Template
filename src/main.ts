import Vue from "vue";
import Vuex from "vuex";
import Router from "vue-router";
import Axios from "axios";
import VueCompositionApi from "@vue/composition-api";
import App from "./routes/app.vue";
import AsyncRoutes from "./routes/async-routes.ts";

Vue.use(Router);
Vue.use(Vuex);
Vue.use(VueCompositionApi);

Vue.config.productionTip = false;

// () => import("./routes/about.vue");

// Library: Thousands seperator for numbers
Vue.filter("formatNumber", function(value){return require("numeral")(value).format("0,0");});

const router = new Router({
  mode: "history",
  // mode: "abstract",
  routes: [{
    path: "/",
    component: () => import("./routes/home.vue")
   },{
    path: "/about",
    component: () => import("./routes/about.vue")
    // component: AsyncRoutes.dashboard
  }]
});

// router.beforeEach((to, from, next) => {
//   console.log(to);
//   console.log(from);
//   next();
//   // if (to.matched.some(route => route.meta.requiresAuth)) {
//   //   store.state.authStatus.then(() => {
//   //     //we're getting 200 status code response here, so user is authorized
//   //     //be sure that API you're consuming return correct status code when user is authorized
//   //     next()
//   //   }).catch(() => {
//   //     //we're getting anything but not 200 status code response here, so user is not authorized
//   //     next({name: 'home'})
//   //   })
//   // } else {
//   //   next()
//   // }
// });

// Everything defined in Vue.mixin will be created in every Vue instance, effectively making these global methods and variables
Vue.mixin({
  // Define basic functions that allow easy usage of reading and writing from the data store
  methods: {
    Read    : function(key     ){return this.$store.state[key]},
    Commit  : function(key, val){this.$store.commit  ("mutation", {key: key, val: val})}, // Synchronous
    Dispatch: function(key, val){this.$store.dispatch("mutation", {key: key, val: val})}, // Asynchronous
    // https://stackoverflow.com/questions/40390411/vuex-2-0-dispatch-versus-commit

    Get: async function(endpoint, params = {}) {
      let response = await this.Axios.get(`${process.env.VUE_APP_BACKEND}/${endpoint}`, {params: params});
      return response["data"];
    },
    Post: async function(endpoint, body = {}) {
      let response = await this.Axios.post(`${process.env.VUE_APP_BACKEND}/${endpoint}`, body, {});
      return response["data"];
    },
    Put: async function(endpoint, body = {}) {
      let response = await this.Axios.put(`${process.env.VUE_APP_BACKEND}/${endpoint}`, body, {});
      return response["data"];
    },
    Delete: async function(endpoint, params = {}) {
      let response = await this.Axios.delete(`${process.env.VUE_APP_BACKEND}/${endpoint}`, {params: params});
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
    // yoloTest: "Hello there"
    yoloTest: null
  },
  mutations: {
    mutation(state, data){
      let key = data["key"];
      let val = data["val"];
      state[key] = val;
    }
  }
});

// Create the application and mount it onto #app
new Vue({
  store : store,
  router: router,
  render: (a) => a(App)
  // ,created: async () => {
  //   () => import("./routes/about.vue")
  // }

  //   console.log("vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv");
  //   let qwe = await Axios.get("http://localhost:8080/about");
  //   console.log(qwe);
  //   console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
  // }
}).$mount("#app");
