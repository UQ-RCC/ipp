import request from '@/utils/request'
import Vue from 'vue'

export default {
  // list desktop
  async list_desktop() {
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/execute/listdesktop`)
    return data
  },
  // start desktop
  async start_desktop(mem, ppn, hours) {
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/execute/startdesktop`, {
        params: {
          mem: mem, 
          ppn: ppn, 
          hours: hours
        }
    });
    return data
  },
  // stop desktop
  async stop_desktop(jobid) {
    await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/execute/stopdesktop`, {
        params: {
          jobidNumber: jobid
        }
    });
  },
  // vnc display
  async vncdisplay() {
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/execute/vncdisplay`);
    return data
  },
  // otp
  async otp() {
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/execute/otp`);
    return data
  },
  //list apps
  async listapps() {
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/execute/listapps`);
    return data
  },
  //list flavours
  async listdesktopflavours() {
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/execute/listflavours`);
    return data
  },
  // launch app
  async launchapp(appid, filespath, copytoscratch) {
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/execute/launchapp`, {
        params: {
          appid: appid,
          filespath: btoa(filespath),
          copytoscratch: copytoscratch
        }
    });
    return data
  },

  async launchfile() {
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/execute/launchfile`);
    return data

  },
  ////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////////
  // the results here are different as it is not using remote job execution
  // configurations
  async listconfigurations() {
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/configurations`);
    return data
  },
  // tunnels
  async listvnctunnels() {
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/listvnctunnels`);
    return data
  },
  async startvnctunnel(desktopname, vncpassword, remotehost, display, via_gateway, configuration) {
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/startvnctunnel`, {
      params: {
        desktopname: desktopname,
        vncpassword: vncpassword,
        remotehost: remotehost, 
        display: display,
        via_gateway: via_gateway,
        configuration: configuration
      }
  });
    return data
  },
  async stopvnctunnel(id) {
    const { data } = await request.get(`${Vue.prototype.$Config.endpoints.wiener}/api/stopvnctunnel`, {
      params: {
        id: id
      }
  });
    return data
  },

 

}
