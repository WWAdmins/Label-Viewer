import Vue from 'vue'
import App from './App.vue'
import VueSimpleAlert from "vue-simple-alert";

Vue.use(VueSimpleAlert);

// Import Bootstrap CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css'



Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
