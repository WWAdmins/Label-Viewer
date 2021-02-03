import Vue from 'vue'
import App from './App.vue'
import VueSimpleAlert from "vue-simple-alert";
import VTooltip from 'v-tooltip';
import { BootstrapVue} from 'bootstrap-vue'

// Import Bootstrap an BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue)


Vue.use(VTooltip);
Vue.use(VueSimpleAlert);

// Import Bootstrap CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css'



Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
