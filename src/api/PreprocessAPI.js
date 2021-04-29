import request from '@/utils/request'
import Vue from 'vue'

export default {
  // list jobs
  async preprocess(usermail, output, prepinfo, jobid) {
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/execute/preprocessing`, {
      params: {
        output: output,
        prepinfo: btoa(prepinfo),
        usermail: usermail,
        jobid: jobid, 
        endpoint: `${Vue.prototype.$Config.endpoints.pref}`
      }
    });
    return data
  }
}