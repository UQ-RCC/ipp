import request from '@/utils/request'
import Config from '@/config'

export default {
  // convert
  async convert(files, output, method, prefix) {
    let fileslist = files.map( file => {
        return btoa(file);
    });          
    const { data } = await request.get(`${Config.endpoints.wiener}/api/execute/convertfilebase64`, {
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
