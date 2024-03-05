import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'
import Keycloak from 'keycloak-js'
import VueLogger from 'vuejs-logger'
import Notifications from 'vue-notification'
import VueCookies from 'vue-cookies'
import VueSimpleAlert from "vue-simple-alert";
import './alert.css'


import axios from 'axios'

Vue.use(VueLogger)
Vue.use(VueCookies)
Vue.use(Notifications)
Vue.use(VueSimpleAlert);

let config = null

const loadConfigAndStart = async () => {
  try {
      config = await axios.get(process.env.BASE_URL + 'config.json')
      
      let Config = {}
      if (process.env.NODE_ENV ==='development')
        Config = config.data.development
      else if(process.env.NODE_ENV ==='production')
        Config = config.data.production
        
      Vue.prototype.$Config = Config

      /*keycloak init*/
      let keycloak = Keycloak({
          url: Config.keycloak.url, 
          realm: Config.keycloak.realm, 
          clientId: Config.keycloak.clientId, 
        })

      //init
      keycloak.init({ 
        onLoad: Config.keycloak.onLoad,
        pkceMethod: 'S256',
        "checkLoginIframe" : false 
      }).then((auth) => {
        if (!auth) {
          Vue.notify({
            group: 'sysnotif',
            type: 'error',
            title: 'Authentication',
            text: 'Problem with authentication! refresh!'
          })
          window.location.reload()
        } else {
          Vue.$log.info("Authenticated")
          Vue.$log.info(keycloak)
          Vue.notify({
            group: 'sysnotif',
            type: 'warn',
            title: 'Authentication',
            text: 'Authenticated!'
          });
          Vue.prototype.$keycloak = keycloak;
          new Vue({
            router,
            vuetify,
            render: h => h(App),
          }).$mount('#app')
        }
      }).catch(() => {
        Vue.$log.error("Authenticated Failed")
        // display message and return to ipp
        Vue.notify({
          group: 'sysnotif',
          type: 'error',
          title: 'Authentication',
          text: 'Problem with authentication! move back to home!'
        })
        //window.location.href = Config.signoutUrl
      
      });
      
      // when token expired
      keycloak.onTokenExpired = function() {
        // update
        keycloak.updateToken(Config.keycloak.minValidity).then(function(refreshed) {
            if (refreshed) {
              Vue.$log.info('Token refreshed' + refreshed)
            } else {
              Vue.$log.info('Token not refreshed, valid for '
                + Math.round(keycloak.tokenParsed.exp + keycloak.timeSkew - new Date().getTime() / 1000) + ' seconds')
            }
          }).catch(function() {
              Vue.$log.error(">>> Cannot refresh token")
              Vue.notify({
                group: 'sysnotif',
                type: 'error',
                title: 'Expiration',
                text: 'Cannot extend your session. Relogin'
              })
              window.location.reload()
          });
        
      }
  } catch (err) {
      console.error(err);
  }
}
loadConfigAndStart()


