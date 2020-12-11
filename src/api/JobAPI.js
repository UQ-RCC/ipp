import request from '@/utils/request'
import Config from '@/config'

export default {
  // list jobs
  async list_jobs() {
    const { data } = await request.get(`${Config.endpoints.wiener}/api/execute/listall`);
    return data
  },
  // stop job
  async stop_job(jobid) {
    const { data } = await request.get(`${Config.endpoints.wiener}/api/execute/stop`{
        params: {
          jobidNumber: jobid
        }
    });
    return data
  },
}