import request from '@/utils/request'
import Vue from 'vue'

export default {
    async list() {
      const { data } = await request.get(`${Vue.prototype.$Config.endpoints.bunya}/api/execute/collections`)
      return data
    }
}
  