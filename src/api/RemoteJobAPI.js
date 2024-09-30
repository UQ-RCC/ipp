import request from '@/utils/request'
import Vue from 'vue'

export default {
  // list jobs
  async list_jobs() {
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/execute/listall`)
    return data
  },
  // stop job
  async stop_job(jobid) {
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/execute/stop`, {
        params: {
          jobidNumber: jobid
        }
    });
    return data
  },

  async scratch_quota() {
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/execute/quota`);
    return data
  },

}