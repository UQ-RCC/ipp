import request from '@/utils/request'
import Config from '@/config'

export default {
  // --------------------- filesexplorer --------------------------//
  // get config of the whole component
  async get_filesxplorer_pref(component) {
    const { data } = await request.get(`${Config.endpoints.pref}/preferences/fileexplorer/components/${component}`)
    return data
  },
  // upate file explorer
  async update_filesxplorer_pref(component, prefid, pref) {
    const { data } = await request.put(`${Config.endpoints.pref}/preferences/fileexplorer/components/${component}/${prefid}`, pref)
    return data
  },
  // add bookmark
  async add_filexplorer_bookmark(component, prefid, bookmark){
    const { data } = await request.post(`${Config.endpoints.pref}/preferences/fileexplorer/components/${component}/${prefid}/bookmarks`, bookmark)
    return data
  },
  // delete bookmark
  async remove_filexplorer_bookmark(component, prefid, bookmarkid){
    await request.delete(`${Config.endpoints.pref}/preferences/fileexplorer/components/${component}/${prefid}/bookmarks/${bookmarkid}`)
  },

  // --------------------- deconvolution --------------------------//
  // series
  // get series
  async get_serie(path){
    if(path) {
      const { data } = await request.get(`${Config.endpoints.pref}/preferences/series`,{
        params: {
          path: btoa(path)
        }
      })
      return data
    } else {
      const { data } = await request.get(`${Config.endpoints.pref}/preferences/series`)
      return data
    }
  },

  // create series
  async create_serie(series){
    const { data } = await request.post(`${Config.endpoints.pref}/preferences/series`, series)
    return data
  },


  //deconvolution
  async get_deconpage(){
    const { data } = await request.get(`${Config.endpoints.pref}/preferences/deconpage`)
    return data
  },

  // get decons in deconpage
  async get_decons(){
    const { data } = await request.get(`${Config.endpoints.pref}/preferences/deconpage/decons`)
    return data
  },

  // get a decon
  async get_decon(deconid){
    const { data } = await request.get(`${Config.endpoints.pref}/preferences/deconpage/decons/${deconid}`)
    return data
  },

  async delete_decon(deconid){
    const { data } = await request.delete(`${Config.endpoints.pref}/preferences/deconpage/decons/${deconid}`)
    return data
  },

  // create a decon
  async create_decon(seriesid, setting){
    const { data } = await request.post(`${Config.endpoints.pref}/preferences/deconpage/decons`, setting, {
      params: {
        series_id: seriesid
      }
    })
    return data
  },





}
  