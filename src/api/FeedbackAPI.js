import Vue from 'vue'
import axios from 'axios'
// this one uses axios directly
export default {
  async send_feedback(title, contents, file, priority) {
    let payload = new FormData()
    payload.append('title', title)
    payload.append('contents', contents)
    payload.append('label', priority)
    if (file)
      payload.append('uploadedFile', file)
    else
      payload.append('uploadedFile', '')
    // send the feedback
    const { data } = axios({
      method: 'post',
      url: `${Vue.prototype.$Config.endpoints.pref}/feedback`,
      data: payload,
      headers: {'Content-Type': 'multipart/form-data',
                'Authorization': 'Bearer ' + Vue.prototype.$keycloak.token,
                }
    })
    return data
  }
}
  