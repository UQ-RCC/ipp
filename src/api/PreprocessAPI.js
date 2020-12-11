import request from '@/utils/request'
import Config from '@/config'

export default {
  // list jobs
  async preprocess(usermail, output, prepinfo) {
    const { data } = await request.get(`${Config.endpoints.wiener}/api/execute/preprocessing`, {
      params: {
        output: output,
        prepinfo: btoa(prepinfo),
        usermail: usermail,
      }
    });
    return data
  }
}