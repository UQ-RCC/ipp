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

  // list local settings
  async list_settings(illuminationType, isglobal) {
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.pref}/preferences/pinholeCalcSettings/${illuminationType}/${isglobal}`)
    return data
  },
   

  async save_settings_file(setting) {
    const { data } = await request.post(`${Vue.prototype.$Config.endpoints.pref}/preferences/pinholeCalcSettings`, setting)
    return data
  },

  async delete_setting_file(settingid) {
    await request.delete(`${Vue.prototype.$Config.endpoints.pref}/preferences/pinholeCalcSettings/${settingid}`)
  },

  // get a setting
 /*  async get_cal_setting(settingid) {
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.pref}/preferences/pinholeCalcSavedsetting/${settingid}`)
    return data
  }, */


}
