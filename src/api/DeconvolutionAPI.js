import request from '@/utils/request'
import Config from '@/config'

export default {
  // get folder info
  async get_folder_info(path) {
    const { data } = await request.get(`${Config.endpoints.wiener}/api/execute/folderinfobase64`, {
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
    const { data } = await request.get(`${Config.endpoints.wiener}/api/execute/filesinfobase64`, {
        params: {
          fileslist: fileslist
        }
    })
    return data
  },

  // get file info
  async get_file_info(filepath) {
    const { data } = await request.get(`${Config.endpoints.wiener}/api/execute/fileinfobase64`, {
        params: {
          filepath: btoa(filepath)
        }
    })
    return data
  },

  // execute
  async execute_microvolution(usermail, output, arrayMax, mem, devices, executioninfo) {
    const { data } = await request.get(`${Config.endpoints.wiener}/api/execute/executemicrovolutionbase64`, {
        params: {
          usermail: usermail,
          output: output, 
          arrayMax: arrayMax,
          mem: mem, 
          devices: devices,
          executioninfo: btoa(executioninfo)  
        }
    })
    return data
  },
}
