import request from '@/utils/request'
import Vue from 'vue'

export default {
    // list path
    async list(path) {
      const { data } = await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/execute/listfolderbase64`, {
        params: {
            folderpath: btoa(path)
        }
      })
      return data
    },
      
    // make dir
    async mkdir(path) {
        const { data } = await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/execute/makedirbase64`, {
            params: {
                folderpath: btoa(path)
            }
        })
        return data
    },

    // use this one for files/folder in the same place
    async simplemove(source, dest) {
        const { data } = await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/execute/simplemovebase64`, {
            params: {
                source: btoa(source),
                dest: btoa(dest)
            }
        })
        return data
    },

    //delete a path
    async delete(path) {
        const { data } = await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/execute/deletebase64`, {
            params: {
                fileslist: btoa(path)
            }
        })
        return data
    },

    // copy folder
    async copy(usermail, sources, dest, parallel, deleteSource, copy) {
        const { data } = await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/execute/copybase64`, {
            params: {
                usermail: usermail,
                sources: btoa(sources),
                dest: btoa(dest),
                parallel: parallel,
                deleteSource: deleteSource,
                copy: copy
            }
        })
        return data
    },
    //read text file
    async readTextFile(filepath) {
        const { data } = await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/execute/readtextfile`, {
            params: {
                filepath: filepath
            }
        })
        return data
    },
}
  