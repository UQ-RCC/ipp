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
  // async get_series(username) {

  // },
  // async add_series(username) {

  // },
  // //deconvolution
  // async get_deconvolution_pref(username){

  // }

}
  