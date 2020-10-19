import request from '@/utils/request'
import Config from '@/config'

export default {
    async list(path) {
      const { data } = await request.get(`${Config.endpoints.wiener}/api/execute/listfolderbase64`, {
        params: {
            folderpath: btoa(path)
        }
      })
      return data
    },
    async mkdir(path) {
        // const { data } = await request.get(`${Config.endpoints.wiener}/api/collections/`, {
        //     params: {
        //         path: path
        //     }
        // })
        // return data
        return {path: path}
    },
    async delete(path) {
        // const { data } = await request.get(`${Config.endpoints.wiener}/api/collections/`, {
        //     params: {
        //         path: path
        //     }
        // })
        // return data
        return {path: path}
    },
    async copy(src, dest) {
        // const { data } = await request.get(`${Config.endpoints.wiener}/api/collections/`, {
        //     params: {
        //         src: src,
        //         desc: dest
        //     }
        // })
        // return data
        return {source: src, dest: dest}
    }
}
  