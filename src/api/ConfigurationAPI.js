import request from '@/utils/request'
import Vue from 'vue'

export default {
    async execute_metedata_script(fileslist, confid, validate, savecsv, savefolder) {
        let _requestUrl =`${Vue.prototype.$Config.endpoints.bunya}/api/execute/imageMetadataBase64`
        const { data } = await request.get(_requestUrl, {
            params: {
                fileslist  : fileslist, 
                confid    : confid,
                validate : validate,
                savecsv: savecsv,
                savefolder: savefolder
            }
        })
        return data 
    },

    
}
