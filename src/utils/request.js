import axios from 'axios'
import Vue from 'vue'

const service = axios.create({
    // baseURL: '', // url = base url + request url
    // withCredentials: true, // send cookies when cross-domain requests
    timeout: 50000 // request timeout
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
      }
      return config
    },
    error => {
      // do something with request error
      Vue.$log.error("here >>>>>>>>>>>>>>>>>>>>>>>>>>");
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
        Vue.$log.error(error)
        Vue.notify({
            group: 'sysnotif',
            type: 'error',
            title: 'Error',
            text: error.message
        })
        return Promise.reject(error)
    }
  )
  
  export default service
