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

    console.log (payload);
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
  async list_jobs(alljobs){
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.pref}/preferences/jobs`, {
      params: {
        all: alljobs
      }
    })
    return data
  },

  // filter jobs
  async filter_jobs(status, username, start, jobname){
    if (status && status.trim() === '')
      status = null
    if (username && username.trim() === '')
      username = null
    if (jobname && jobname.trim() === '')
      jobname = null
    if (start && start.trim() === '')
      start = null
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.pref}/jobs`, {
      params: {
        status: status,
        username: username,
        start: start,
        jobname: jobname
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
  async delete_job(jobid){
    await request.delete(`${Vue.prototype.$Config.endpoints.pref}/preferences/jobs/${jobid}`)
  },

  async cancel_job(jobid){
    let payload = {"status": "CANCELLED"}
    await request.put(`${Vue.prototype.$Config.endpoints.pref}/jobs/${jobid}`, payload)
  },

  async delete_decon_jobs(jobs){
    await request.delete(`${Vue.prototype.$Config.endpoints.pref}/preferences/jobs/`, jobs)
  },

  //convert
  async get_convertpage(){
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.pref}/preferences/convertpage`)
    return data
  },
  async update_convert(convertid, payload){
    const { data } = await request.put(`${Vue.prototype.$Config.endpoints.pref}/preferences/convert/${convertid}`, payload)
    return data
  },

  async get_convert_job(convertid, sendemail){
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.pref}/preferences/convert/${convertid}/job?sendemail=${sendemail}`)
    return data
  },

  async create_new_convert(){
    const { data } = await request.post(`${Vue.prototype.$Config.endpoints.pref}/preferences/convertpage/convert`)
    return data
  },

  // preprocessing
  async get_preprocessingpage(){
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.pref}/preferences/preprocessingpage`)
    return data
  },

  async save_preprocessing(preprocessing){
    await request.put(`${Vue.prototype.$Config.endpoints.pref}/preferences/preprocessing/${preprocessing.id}?combine=${preprocessing.combine}&outputPath=${preprocessing.outputPath}`)
  },

  async create_psetting(preprocessingid, series_id){
    const { data } = await request.post(`${Vue.prototype.$Config.endpoints.pref}/preferences/preprocessing/${preprocessingid}/psettings?series_id=${series_id}`)
    return data
  },

  async get_psetting(psettingid){
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.pref}/preferences/psettings/${psettingid}`)
    return data
  },

  async delete_psetting(psettingid){
    await request.delete(`${Vue.prototype.$Config.endpoints.pref}/preferences/psettings/${psettingid}`)
  },

  async save_psetting(workingItem){
    if(!workingItem.id)
      return
    let _psetting = Object.assign({}, workingItem)
    delete _psetting.series
    await request.put(`${Vue.prototype.$Config.endpoints.pref}/preferences/psettings/${_psetting.id}`, _psetting)
  },

  async get_preprocessing_job(preprocesingid, sendemail){
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.pref}/preferences/preprocessing/${preprocesingid}/job?sendemail=${sendemail}`)
    return data
  },

  async create_new_processing(){
    const { data } = await request.post(`${Vue.prototype.$Config.endpoints.pref}/preferences/preprocessingpage/preprocessing`)
    return data
  },

  // particle counting
  async get_pcpage(){
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.pref}/preferences/particlecountingpage`)
    return data
  },

  async get_pc_job(pcid, sendemail){
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.pref}/preferences/particlecounting/${pcid}/job?sendemail=${sendemail}`)
    return data
  },

  async create_new_pc(){
    const { data } = await request.post(`${Vue.prototype.$Config.endpoints.pref}/preferences/particlecountingpage/particlecounting`)
    return data
  },

  async update_pc(pcid, payload){
    const { data } = await request.put(`${Vue.prototype.$Config.endpoints.pref}/preferences/particlecounting/${pcid}`, payload)
    return data
  },

  //macro scripts

  async get_macro(){
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.pref}/preferences/macro`)
    return data
  },

  async create_new_macro(payload){
    const { data } = await request.post(`${Vue.prototype.$Config.endpoints.pref}/preferences/macro`, payload)
    return data
  },

  async update_macro(macro_id, payload){
    const { data } = await request.put(`${Vue.prototype.$Config.endpoints.pref}/preferences/macro/${macro_id}`, payload)
    return data
  },

  async create_macro_job(macro_id, sendemail){
    const { data } = await request.post(`${Vue.prototype.$Config.endpoints.pref}/preferences/macro/jobs?macro_id=${macro_id}&sendemail=${sendemail}`)
    return data
  },

  //configuration

  async save_api_option(api) {
    const { data }= await request.post(`${Vue.prototype.$Config.endpoints.pref}/preferences/configuration?api=${api}`)
    return data
  },
  
  async get_api_option() {
    const { data }= await request.get(`${Vue.prototype.$Config.endpoints.pref}/preferences/configuration`)
    return data
  },
 
  
}
  