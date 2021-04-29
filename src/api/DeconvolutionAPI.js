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

  // execute
  async execute_microvolution(output, instances, mem, devices, executioninfo, jobs, is_test=false) {
    let _requestUrl = ""
    if (is_test) {
      _requestUrl = `${Vue.prototype.$Config.endpoints.wiener}/api/execute/testexecutebase64`      
    } else {
      _requestUrl = `${Vue.prototype.$Config.endpoints.wiener}/api/execute/executemicrovolutionbase64`
    }
    let arrayMax = parseInt(instances) - 1
    // modify executioninfo 
    let execinfo = Object.assign({}, executioninfo.setting)
    execinfo.files = executioninfo.series.path
    execinfo.jobs = jobs
    execinfo.endpoint = `${Vue.prototype.$Config.endpoints.pref}`
    // remove unneeded fields
    // delete execinfo.id //refers to settingid
    // delete execinfo.decon_id
    // delete execinfo.decon
    // delete execinfo.isfolder
    // delete execinfo.name
    delete execinfo.decon
    const { data } = await request.get(_requestUrl, {
        params: {
          output: output, 
          arrayMax: arrayMax,
          mem: mem, 
          devices: devices,
          executioninfo: btoa(JSON.stringify(execinfo))  
        }
    })
    return data
  },
}
