import request from '@/utils/request'
import Vue from 'vue'

export default {
  // get folder info
  async get_folder_info(path) {
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/execute/folderinfobase64`, {
        params: {
          folderpath: btoa(path)
        }
    })
    return data
  },
  
  // get files info
  async get_files_info(filespath) {
    let fileslist = filespath.map( file => {
      console.log(btoa(file))
      return btoa(file);
    }); 
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/execute/filesinfobase64`, {
        params: {
          fileslist: fileslist
        }
    })
    return data
  },

  // get file info
  async get_file_info(filepath) {
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/execute/fileinfobase64`, {
        params: {
          filepath: btoa(filepath)
        }
    })
    return data
  },

  async validate_devices(jobs,mem,gpus){
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/execute/validateDevices`, {
      params: {
        jobs: jobs,
        mem: mem,
        gpus: gpus
      }
  })
  return data

  },  

 async cancel_estimate() {
    const { data } =  await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/execute/estimateCancel`);
    return data
  }, 

  async queue_time(nodes, mem, gpus, partition, qos) {
    const { data } =  await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/execute/queueTime`,{
      params: {
        nodes: nodes,
        mem: mem,
        gpus: gpus,
        partition: partition,
        qos:qos
      }
    });
    return data
  },

  async user_limits() {
    const { data } =  await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/execute/userLimits`);
    return data
  },

  // execute
  async execute_microvolution(output, instances, mem, devices, executioninfo, jobs, is_test=false, is_estimate, is_cudaDecon) {
    let _requestUrl = ""
    if (is_test && !is_estimate && !is_cudaDecon) {
      _requestUrl = `${Vue.prototype.$Config.endpoints.wiener}/api/execute/testexecutebase64`      
    } else if(is_estimate && !is_test && !is_cudaDecon){
      _requestUrl = `${Vue.prototype.$Config.endpoints.wiener}/api/execute/estimateDevices`  
    } else if (is_cudaDecon && !is_test && !is_estimate){
      _requestUrl = `${Vue.prototype.$Config.endpoints.wiener}/api/execute/CudaDeconbase64`
    } else if ((!is_cudaDecon && !is_test && !is_estimate)) {
      _requestUrl = `${Vue.prototype.$Config.endpoints.wiener}/api/execute/executemicrovolutionbase64`
    }
    let arrayMax = parseInt(instances) - 1
    // modify executioninfo 
    let execinfo 
    
    if(is_estimate) {
      execinfo = Object.assign({}, executioninfo)
      execinfo.files = executioninfo.filepath
    }else{
      execinfo = Object.assign({}, executioninfo.setting)
      execinfo.files = executioninfo.series.path
    }
    execinfo.jobs = jobs
    execinfo.endpoint = `${Vue.prototype.$Config.endpoints.pref}`
    execinfo.is_estimate = is_estimate
    // remove unneeded fields
    // delete execinfo.id //refers to settingid
    // delete execinfo.decon_id
    // delete execinfo.decon
    // delete execinfo.isfolder
    // delete execinfo.name
    delete execinfo.decon
    console.log(_requestUrl)
    console.log(execinfo)

    let endpoint = `${Vue.prototype.$Config.endpoints.pref}`
    // let apihost = /^(?:\w+\:\/\/)?([^\/]+)(.*)$/.exec(endpoint)[1]
    let apihost = /^(?:\w+:\/\/)?([^/]+)(.*)$/.exec(endpoint)[1]
    console.log("----run estimate api API call---")
    let today = new Date();
    let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    let time = today.getHours() + "-" + today.getMinutes() + "-" + today.getSeconds();
    console.log(date+'_'+time)
    const { data } = await request.get(_requestUrl, {
        params: {
          output: output, 
          arrayMax: arrayMax,
          mem: mem, 
          devices: devices,
          apihost: apihost,
          executioninfo: btoa(JSON.stringify(execinfo))  
        }
    })
    return data
  },

  
}
