import request from '@/utils/request'
import Vue from 'vue'

export default {
  // --------------------- filesexplorer --------------------------//
  // get config of the whole component
  async get_filesxplorer_pref(component) {
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.pref}/preferences/fileexplorer/components/${component}`)
    return data
  },
  // upate file explorer
  async update_filesxplorer_pref(component, prefid, pref) {
    const { data } = await request.put(`${Vue.prototype.$Config.endpoints.pref}/preferences/fileexplorer/components/${component}/${prefid}`, pref)
    return data
  },
  // add bookmark
  async add_filexplorer_bookmark(component, prefid, bookmark){
    const { data } = await request.post(`${Vue.prototype.$Config.endpoints.pref}/preferences/fileexplorer/components/${component}/${prefid}/bookmarks`, bookmark)
    return data
  },
  // delete bookmark
  async remove_filexplorer_bookmark(component, prefid, bookmarkid){
    await request.delete(`${Vue.prototype.$Config.endpoints.pref}/preferences/fileexplorer/components/${component}/${prefid}/bookmarks/${bookmarkid}`)
  },

  // --------------------- deconvolution --------------------------//
  // series
  // get series
  async get_serie(path){
    if(path) {
      const { data } = await request.get(`${Vue.prototype.$Config.endpoints.pref}/preferences/series`,{
        params: {
          path: btoa(path)
        }
      })
      return data
    } else {
      const { data } = await request.get(`${Vue.prototype.$Config.endpoints.pref}/preferences/series`)
      return data
    }
  },


  async get_serie_by_id(serieid){
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.pref}/preferences/series/${serieid}`)
    return data
  },

  // create series
  async create_serie(series){
    const { data } = await request.post(`${Vue.prototype.$Config.endpoints.pref}/preferences/series`, series)
    return data
  },


  // setting
  async get_setting_by_id(settingid){
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.pref}/preferences/settings/${settingid}`)
    return data
  },


  // update setting
  async update_setting(settingid, setting){
    const { data } = await request.put(`${Vue.prototype.$Config.endpoints.pref}/preferences/settings/${settingid}`, setting)
    return data
  },

  // update decon
  async update_decon(deconid, decon){
    let newDecon = Object.assign({}, decon)
    let setting = Object.assign({}, newDecon.setting)
    // these are not needed
    delete newDecon.setting
    delete newDecon.series
    const payload = {
      decon: newDecon,
      setting: setting
    }
    const { data } = await request.put(`${Vue.prototype.$Config.endpoints.pref}/preferences/deconpage/decons/${deconid}`, payload)
    return data
  },

  
  //deconvolution
  async get_deconpage(){
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.pref}/preferences/deconpage`)
    return data
  },

  // get decons in deconpage
  async get_decons(seriepath){
    if(seriepath){
      const { data } = await request.get(`${Vue.prototype.$Config.endpoints.pref}/preferences/deconpage/decons`,{
        params: {
          path: btoa(seriepath)
        }
      })
      return data  
    }
    else {
      const { data } =  await request.get(`${Vue.prototype.$Config.endpoints.pref}/preferences/deconpage/decons`)
      return data
    }
  },

  // get a decon
  async get_decon(deconid){
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.pref}/preferences/deconpage/decons/${deconid}`)
    return data
  },
  // delete decon with id
  async delete_decon(deconid){
    const { data } = await request.delete(`${Vue.prototype.$Config.endpoints.pref}/preferences/deconpage/decons/${deconid}`)
    return data
  },

  // delete decon with path
  async delete_decon_using_path(path){
    await request.delete(`${Vue.prototype.$Config.endpoints.pref}/preferences/deconpage/decons`, {
      params: {
        path: btoa(path)
      }
    })
  },

  // create a decon
  async create_decon(seriesid, setting){
    const { data } = await request.post(`${Vue.prototype.$Config.endpoints.pref}/preferences/deconpage/decons`, setting, {
      params: {
        series_id: seriesid
      }
    })
    return data
  },

  // creat a number of jobs from a decon
  async create_decon_jobs(decon_id, numberofjobs){
    // const { data } = await request.post(`${Vue.prototype.$Config.endpoints.pref}/preferences/jobs`, {
    //   params: {
    //     decon_id: decon_id,
    //     numberofjobs: numberofjobs
    //   }
    // })
    const { data } = await request.post(`${Vue.prototype.$Config.endpoints.pref}/preferences/jobs?decon_id=${decon_id}&numberofjobs=${numberofjobs}`)
    return data
  },
  // list jobs
  async list_decon_jobs(alljobs){
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.pref}/preferences/jobs`, {
      params: {
        all: alljobs
      }
    })
    return data
  },
  // list a job
  async list_decon_job(jobid){
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.pref}/preferences/jobs/${jobid}`, {
      params: {
        jobid: jobid
      }
    })
    return data
  },
  async delete_decon_job(jobid){
    await request.delete(`${Vue.prototype.$Config.endpoints.pref}/preferences/jobs/${jobid}`, {
      params: {
        jobid: jobid
      }
    })
  },
  async delete_decon_jobs(jobs){
    await request.delete(`${Vue.prototype.$Config.endpoints.pref}/preferences/jobs/`, jobs)
  },

  //convert
  async get_convertpage(){
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.pref}/preferences/convertpage`)
    return data
  },
  async update_convertpage(payload){
    const { data } = await request.put(`${Vue.prototype.$Config.endpoints.pref}/preferences/convertpage`, payload)
    return data
  },
}
  