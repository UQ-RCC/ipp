import request from '@/utils/request'
import Vue from 'vue'

export default {

    // execute
    async execute_macro_script(output, instances, mem, devices,macroinfo ) {
        let _requestUrl =`${Vue.prototype.$Config.endpoints.bunya}/api/execute/executeMacroBase64`
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

     
     async saveFile(filename, folder, commitId, gituser, gitpat, islocal) {
        if(islocal) {
            const { data } = await request.get(`${Vue.prototype.$Config.endpoints.bunya}/api/execute/copymacrobase64`, {
                params: {
                    folder: folder,
                    filename : filename
                }
            })
            return data

        }else {
            const { data } = await request.get(`${Vue.prototype.$Config.endpoints.bunya}/api/execute/savemacrobase64`, {
                params: {
                    folder: folder,
                    filename : filename,
                    commitId : commitId,
                    gituser: gituser,
                    gitpat: btoa(gitpat)
    
                }
            })
            return data
        }
      }, 

      //read text file
    async readMacroFile(filepath) {
        const { data } = await request.get(`${Vue.prototype.$Config.endpoints.bunya}/api/execute/readTextFile`, {
            params: {
                filepath: filepath
            }
        })
        return data
    },
}