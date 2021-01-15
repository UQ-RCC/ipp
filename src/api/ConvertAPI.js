import request from '@/utils/request'
import Vue from 'vue'

export default {
  // convert
  async convert(files, output, method, prefix) {
    let fileslist = files.map( file => {
        return btoa(file);
    });          
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/execute/convertfilebase64`, {
        params: {
            output: output,
            method: method,
            prefix: prefix,
            files: fileslist
        }
    })
    return data
  },
  
}
