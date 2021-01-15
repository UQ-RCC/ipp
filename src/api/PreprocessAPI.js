import request from '@/utils/request'
import Vue from 'vue'

export default {
  // list jobs
  async preprocess(usermail, output, prepinfo) {
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/execute/preprocessing`, {
      params: {
        output: output,
        prepinfo: btoa(prepinfo),
        usermail: usermail,
      }
    });
    return data
  }
}