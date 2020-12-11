import request from '@/utils/request'
import Config from '@/config'

export default {
  // list templates
  async list_templates() {
    const { data } = await request.get(`${Config.endpoints.wiener}/api/execute/listtemplate`)
    return data
  },

  // load template
  async load_template(name) {
    const { data } = await request.get(`${Config.endpoints.wiener}/api/execute/loadtemplate`, {
        params: {
            templateName: name
        }
    })
    return data
  },

  // save template
  // {'lateralSpacing':{latSpacing},'axialSpacing':{axSpacing},'psfLatSpacing':{psfLatSpacing},
  //  'psfAxSpacing':{psfAxSpacing},'padding':{padding},'tiling':{tiling},'NA':{NA},'ns':{ns},'RI':{RI},
  //  'psfModel':{psfModel},'backgroundType':{backgroundType},'swapZT':{swapZT},'swapPsfZT':{swapPsfZT},
  //  'iterations':{iterations},'wavelength':{wavelength},'pinholes':{pinholes},'background':{background},
  //  'devices':{devices},'generatePsf':{generatePsf},'psfFile':{psfFile},'instances':{instances},'mem':{mem},
  //  'regularizationType':{regType},'regularization':{regularization},'preFilter':{prefilter},'postFilter':{postfilter},
  //  'blind':{blind},'scaling':{scaling},'format':{format},'psfType':{psfType}
  async save_template(templateValues) {
    const { data } = await request.get(`${Config.endpoints.wiener}/api/execute/savetemplate`, {
        params: templateValues
    })
    return data
  },  
}
