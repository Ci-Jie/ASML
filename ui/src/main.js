import Vue from 'vue'
import App from './App.vue'
import iView from 'iview'
import VueSocketio from 'vue-socket.io'
import VCharts from 'v-charts'
import 'iview/dist/styles/iview.css'

Vue.config.productionTip = false

require('dotenv').config()

Vue.use(iView)
Vue.use(VCharts)
Vue.use(VueSocketio, `http://${ process.env.K8S_MASTER_IP }:3000`)

new Vue({
  render: h => h(App)
}).$mount('#app')
