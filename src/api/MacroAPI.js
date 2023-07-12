import request from '@/utils/request'
import Vue from 'vue'

export default {

    // execute
    async execute_macro_script(output, instances, mem, devices,macroinfo ) {
        let _requestUrl =`${Vue.prototype.$Config.endpoints.wiener}/api/execute/executeMacroBase64`
        console.log(_requestUrl)
        let arrayMax = parseInt(instances) - 1
        let endpoint = `${Vue.prototype.$Config.endpoints.pref}`
        
        let apihost = /^(?:\w+:\/\/)?([^/]+)(.*)$/.exec(endpoint)[1]
        
        
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
      /* async saveFile(code, folder,filename) {
        
        const { data } = await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/execute/savemacrobase64`, {
            params: {
                folder: folder,
                filename : filename,
                code: code
            }
        })
        return data

      },  */
     async saveFile(filename, folder, commitId) {
        
        const { data } = await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/execute/savemacrobase64`, {
            params: {
                folder: folder,
                filename : filename,
                commitId : commitId

            }
        })
        return data

      }, 
}