import request from '@/utils/request'
import Vue from 'vue'

export default {
  // list templates
  async list_templates() {
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.pref}/preferences/templates`)
    return data
  },

  // create new template
  async create_template(templatename, setting) {
    const { data } = await request.post(`${Vue.prototype.$Config.endpoints.pref}/preferences/templates`, setting, {
      params: {
        templatename: templatename
      }
    })
    return data
  },

  // get a template
  async get_template(templateid) {
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.pref}/preferences/templates/${templateid}`)
    return data
  },

  //delete a template
  async delete_template(templateid) {
    await request.delete(`${Vue.prototype.$Config.endpoints.pref}/preferences/templates/${templateid}`)
  },
}
