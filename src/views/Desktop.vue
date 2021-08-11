<template>
    <div>
        <div />
        <v-progress-linear
            color="primary accent-4"
            indeterminate
            rounded
            height="4"
            :active="loading"
        ></v-progress-linear>
        <div v-if="!valid">
            <h3>Could not open virtual desktop. Please try again!</h3>
        </div>
        <div class="container">
            <iframe 
                src="/guacamole/"
                id="guacamoleFrame"
                layout-fill seamless='seamless'
                frameborder="0" 
                v-if="cookiesReady"
                v-show="desktopReady"
                >
           </iframe>
        </div>
    </div>
</template>

<script>
    import DesktopAPI from "@/api/DesktopAPI.js"
    import Vue from 'vue'

    export default {
        name: 'Desktop',
        data() {
            var data = {
                desktopid: 0,
                desktopName: "",
                exechost: "",
                vncdisplay: 0, 
                otp: "",
                config: "",
                valid: false,
                loading: false,
                tunnel: null,
                cookiesReady: false,
                desktopReady: false,
                timer: null
            }
            return data
        },
        mounted: async function() {
            this.loading = true
            this.desktopid = this.$route.query.desktopid
            this.exechost = this.$route.query.exechost
            if (this.desktopid && this.exechost ) {
                this.valid = true
            } else {
                this.valid = false
                this.loading = false
            }
            if(this.valid === true) {
                Vue.$log.info("Continue ...")
                this.desktopName = "desktop" + this.desktopid
                // get vnc display
                let vncDisplayRes = await DesktopAPI.vncdisplay()
                // Vue.$log.info(vncDisplayRes)
                this.vncdisplay = Number(vncDisplayRes.commandResult[0].vncDisplay)
                // get otp
                let otpRes = await DesktopAPI.otp()
                // Vue.$log.info(otpRes)
                this.otp = otpRes.commandResult[0].vncPasswd
                if(this.otp && this.vncdisplay) {
                    // configurations
                    let configs = await DesktopAPI.listconfigurations()
                    this.config = Object.keys(configs)[0]
                    console.log("config:" + this.config)
                    // vnc tunnels
                    let tunnels = await DesktopAPI.listvnctunnels()
                    console.log("tunnels")
                    console.log(tunnels)
                    for(let _index =0; _index < tunnels.length; _index++){
                        if (tunnels[_index].desktopName === this.desktopName) {
                            this.tunnel = tunnels[_index]
                        }
                    }
                    if (this.tunnel != null) {
                        let viaGateway = null
                        this.tunnel = await DesktopAPI.startvnctunnel(this.desktopName, this.otp, this.exechost, this.vncdisplay, viaGateway, this.config)
                    } 
                    if (this.tunnel == null) {
                        Vue.notify({
                            group: 'sysnotif',
                            type: 'error',
                            title: 'Error',
                            text: 'Could not open the desktop at the moment (cannot create tunnel). Please try again!!!'
                        })
                        return
                    }
                    
                    // messing with cookies
                    this.$cookies.remove("ssh-credentials-strudel-web")
                    this.$cookies.remove("vnc-credentials-strudel-web")
                    this.$cookies.set("vnc-credentials-strudel-web", JSON.stringify(
                        {
                            'hostname': 'localhost',
                            'port': this.tunnel.localPort.toString(),
                            'password': this.otp,
                            'protocol': 'vnc',
                            'name': this.desktopName
                        }
                    ), 2 * 60 * 1000)
                    localStorage.removeItem("GUAC_AUTH")
                    localStorage.removeItem("GUAC_HISTORY")
                    this.cookiesReady = true

                    this.timer = setInterval(() => {
                        var guacamoleFrame = document.getElementById("guacamoleFrame")
                        if(!guacamoleFrame){
                            console.log("not ready...")
                        }
                        else {
                            console.log("ready...")
                            clearInterval(this.timer)
                            var guacamoleContent = guacamoleFrame.contentDocument || guacamoleFrame.contentWindow.document
                            guacamoleContent.location.hash = "#/" + this.desktopName
                            guacamoleFrame.contentWindow.focus()
                            this.desktopReady = true
                            this.loading = false
                        }
                    }, 2000)
                    //end
                } else {
                    this.valid = false
                    this.loading = false
                    Vue.notify({
                            group: 'sysnotif',
                            type: 'error',
                            title: 'Error',
                            text: 'Could not open the desktop at the moment. Please try again!!!'
                        })
                }
                
            }
        }, // end mounted
        async destroyed() {
            if(this.tunnel){
                Vue.$log.info("Destroying tunnel:" + this.tunnel.id)
                await DesktopAPI.stopvnctunnel(this.tunnel.id)
            }
        },
    }
</script>