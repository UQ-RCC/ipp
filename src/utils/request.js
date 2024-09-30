import axios from 'axios'
import Vue from 'vue'

const service = axios.create({
    // baseURL: '', // url = base url + request url
    // withCredentials: true, // send cookies when cross-domain requests
    timeout: 300000 // request timeout
  })
  
  // request interceptor
  service.interceptors.request.use(
    config => {
      // do something before request is sent
      if (Vue.prototype.$keycloak && Vue.prototype.$keycloak.token 
            && !Vue.prototype.$keycloak.isTokenExpired(Vue.prototype.$Config.keycloak.minValidity)) {
        // config.headers['token'] = Vue.prototype.$keycloak.token
        config.headers['Authorization'] = 'Bearer ' + Vue.prototype.$keycloak.token;
        // config.headers['Access-Control-Allow-Origin'] = '*';
        return config
      }
      else if (Vue.prototype.$keycloak.isTokenExpired(Vue.prototype.$Config.keycloak.minValidity)) {
        // token expired
        Vue.prototype.$keycloak.updateToken(Vue.prototype.$Config.keycloak.minValidity).then(function(refreshed) {
          if (refreshed) {
            Vue.$log.info('Token refreshed' + refreshed)
            config.headers['Authorization'] = 'Bearer ' + Vue.prototype.$keycloak.token
            return config
          } else {
            Vue.$log.info('Token not refreshed, valid for '
              + Math.round(Vue.prototype.$keycloak.tokenParsed.exp + Vue.prototype.$keycloak.timeSkew - new Date().getTime() / 1000) + ' seconds')
          }
        }).catch(function() {
            Vue.$log.error(">>> Cannot refresh token")
            window.location.reload()
        })
      }
    },
    error => {
      // do something with request error
      Vue.$log.error("request error here timeout>>>>>>>>>>>>>>>>>>>>>>>>>>");
      Vue.$log.error(error);
      return Promise.reject(error);
    }
  )

  
  // response interceptor
service.interceptors.response.use(
    /**
     * If you want to get http information such as headers or status
     * Please return  response => response
    */
  
    /**
     * Determine the request status by custom code
     * Here is just an example
     * You can also judge the status by HTTP Status Code
     */
    response => {
      return response
    },
    error => {
      Vue.$log.error("response error here >>>>>>>>>>>>>>>>>>>>>>>>>>");
      Vue.$log.error(error)
      if (error.response) {
        Vue.$log.error("Status Code:", error.response.status);
      
        // Log the request URL
        Vue.$log.error("Request URL:", error.response.config.url);

        // Log the response data
        Vue.$log.error("Response Data:", error.response.data);

        // Log the request headers
        Vue.$log.error("Request Headers:", error.response.config.headers);

        // Log the response headers
        Vue.$log.error("Response Headers:", error.response.headers);

        // if token expired, refresh the whole page
        if(error.response.status === 401) {
          Vue.notify({
            group: 'sysnotif',
            type: 'warning',
            title: 'Token expired',
            text: 'Token expired! reload the window!'
          })
          window.location.reload()
        } else {
          console.log(error.response.status)
          // no need to tell the problem
          /*Vue.notify({
            group: 'sysnotif',
            type: 'error',
            title: 'Error',
            text: 'There has been a problem:' + String(error)
          })*/
        }
      }else {
        // If no response was received, it could be a network error
        Vue.$log.error("No response received from server.");
        Vue.$log.error("Error Message:", error.message);
      }
      return Promise.reject(error)
    }
  )
  
  export default service
