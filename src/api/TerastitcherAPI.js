import request from '@/utils/request'
import Vue from 'vue'

export default {

    // execute
   /*  async execute_step(importData, outputPath ) {
        let _requestUrl =`${Vue.prototype.$Config.endpoints.bunya}/api/execute/teraImport`
        
            
        console.log(importData)
        console.log( btoa(JSON.stringify(importData)))
        const { data } = await request.get(_requestUrl, {
            params: {
              payload : btoa(JSON.stringify(importData)),
              output : outputPath
                
            },
        })
        return data 
    }, */
    async submit_step(payload, outputPath ) {
      let _requestUrl =""
      if(payload.teraStep === "merge"){
         _requestUrl =`${Vue.prototype.$Config.endpoints.bunya}/api/execute/teraMerge`
         
      }
      else {
         _requestUrl =`${Vue.prototype.$Config.endpoints.bunya}/api/execute/teraExecute`
      }
        
            
      console.log(payload)
      console.log( btoa(JSON.stringify(payload)))
      console.log("output path:", outputPath)
      let endpoint = `${Vue.prototype.$Config.endpoints.pref}`
    // let apihost = /^(?:\w+\:\/\/)?([^\/]+)(.*)$/.exec(endpoint)[1]
      let apihost = /^(?:\w+:\/\/)?([^/]+)(.*)$/.exec(endpoint)[1]
      payload.API_HOST = apihost

      let response = null

      if(payload.teraStep === "merge"){
        response = await request.get(_requestUrl, {
            params: {
              payload : btoa(JSON.stringify(payload)),
              output : outputPath,
              mem: payload.mem, 
              devices: payload.instances,
              walltime: payload.walltime,
              gpus: payload.gpus,
              qos: payload.qos
                
            },
        })
      } else {
          response = await request.get(_requestUrl, {
            params: {
              payload : btoa(JSON.stringify(payload)),
              output : outputPath,
              qos: payload.qos
                
            },
        })
      }

      const { data } = response
        return data 
    },

    async submit_movefiles(payload, outputPath ) {
      let _requestUrl = `${Vue.prototype.$Config.endpoints.bunya}/api/execute/teraMoveFiles`
      const { data } = await request.get(_requestUrl, {
        params: { 
          output: outputPath,
          qos: payload.qos,
          inputpath: payload.volumePath,
          types: payload.setup_arrangement_type,
          x: payload.setup_x,
          y: payload.setup_y

        },
      })
      return data

    },
      
    async poll_step_status(jobId, outputPath) {
      let _requestUrl = `${Vue.prototype.$Config.endpoints.bunya}/api/execute/teraStepStatus`
      const { data } = await request.get(_requestUrl, {
        params: {
          jobId: jobId,
          output: outputPath
        },
      })
      return data
    },

    async get_step_result(outputPath, step) {
      // Fetch the result JSON file written by python
      let _requestUrl = `${Vue.prototype.$Config.endpoints.bunya}/api/execute/teraStepResult`
      const { data } = await request.get(_requestUrl, {
        params: { 
          output: outputPath,
          step: step 
        },
      })
      return data
    },

    async get_step_xmls(outputPath){
      let _requestUrl = `${Vue.prototype.$Config.endpoints.bunya}/api/execute/teraStepXmls`
      const { data } = await request.get(_requestUrl, {
        params: { 
          output: outputPath
        },
      })
      return data
    }


      

}