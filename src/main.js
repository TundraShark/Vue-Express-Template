import Vue from "vue"
import Router from "vue-router"
import Home from "./views/Home.vue"
import About from "./views/About.vue"
import App from "./App.vue"

const router = new Router({
  routes: [{
    path: "/",
    name: "home",
    component: Home
   },{
    path: "/about",
    name: "about",
    component: About
  }]
});

Vue.use(Router);

new Vue({
  router: router,
  render: (a) => a(App)
}).$mount("#app");
