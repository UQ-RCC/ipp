import request from '@/utils/request'
import Vue from 'vue'

export default {
  // convert
  async convert(convertinfo, maxSize) {
    let endpoint = `${Vue.prototype.$Config.endpoints.pref}`
    // let apihost = /^(?:\w+\:\/\/)?([^\/]+)(.*)$/.exec(endpoint)[1]
    let apihost = /^(?:\w+:\/\/)?([^/]+)(.*)$/.exec(endpoint)[1]
    // only need to multiple by 2.2
    let mem = Math.ceil((maxSize * 2.2 )/(1024 * 1024 * 1024.0))
    // maximum mem in a node
    if(mem > 384)
      mem = 384
    convertinfo.mem = mem
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/execute/convertfilebase64`, {
        params: {
            output: convertinfo.output,
            convertinfo: btoa(JSON.stringify(convertinfo)),
            apihost: apihost,
            mem: mem
        }
    })
    return data
  },
  
}
