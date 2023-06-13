import request from '@/utils/request'
import Vue from 'vue'

export default {

    // execute
    async execute_macro_script(output, instances, mem, devices,macroinfo ) {
        let _requestUrl =`${Vue.prototype.$Config.endpoints.wiener}/api/execute/executemacroscriptbase64`
        console.log(_requestUrl)
        let arrayMax = parseInt(instances) - 1
        let endpoint = `${Vue.prototype.$Config.endpoints.pref}`
        
        let apihost = /^(?:\w+:\/\/)?([^/]+)(.*)$/.exec(endpoint)[1]
        console.log(macroinfo)
        console.log(btoa(JSON.stringify(macroinfo)))
        console.log(JSON.stringify(macroinfo))
        console.log(output)
        console.log(arrayMax)
        console.log(apihost)
        console.log(mem)
        console.log(devices)
        
        const { data } = await request.get(_requestUrl, {
            params: {
                output  : output, 
                arrayMax    : arrayMax,
                mem : mem, 
                devices : devices,
                apihost : apihost,
                macroinfo : btoa(JSON.stringify(macroinfo)) 
                
            }
        })
        return data 
      },

      //save file
      async saveFile(code, folder,filename) {
        const { data } = await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/execute/savemacrobase64`, {
            params: {
                folder: folder,
                filename : filename,
                code: btoa(code)
            }
        })
        return data

      },
}