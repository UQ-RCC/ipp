import request from '@/utils/request'
import Vue from 'vue'

export default {
  // list jobs
  async preprocess(preprocessingjobinfo, mem) {
    let endpoint = `${Vue.prototype.$Config.endpoints.pref}`
    // let apihost = /^(?:\w+\:\/\/)?([^\/]+)(.*)$/.exec(endpoint)[1]
    let apihost = /^(?:\w+:\/\/)?([^/]+)(.*)$/.exec(endpoint)[1]
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.bunya}/api/execute/preprocessing`, {
      params: {
        output: preprocessingjobinfo.outputPath,
        prepinfo: btoa(JSON.stringify(preprocessingjobinfo)),
        apihost: apihost, 
        mem: mem
      }
    });
    return data
  }
}