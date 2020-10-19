import request from '@/utils/request'
import Config from '@/config'

export default {
    async get(id) {
      const { data } = await request.get(`${Config.endpoints.pref}/api/pref/${id}`, {
        params: {
        }
      })
      return data
    }
}
  