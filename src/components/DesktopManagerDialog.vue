<template>
    <v-dialog v-model="dialog" persistent max-height="80%" max-width="80%">
        
        <v-card>
            <v-toolbar dark color="#49075e">
                <v-btn icon dark @click="cancel" title="Close this dialogue">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-card-title class="headline">
                    Desktops Manager
                </v-card-title>
            </v-toolbar>

            <desktop-manager-component :desktopManagerOnly=false ref="desktopmanager" />

        </v-card>
    </v-dialog>
</template>

<script>
    import DesktopManagerComponent from "./DesktopManagerComponent.vue"
    import Vue from 'vue'

    export default {
        name: 'DesktopManagerDialog',
        components: { DesktopManagerComponent },
        data() {
            return {
                dialog: false,
            }
        },

        methods: {
            //////////////////////////////////////
            // methods for opening/closing this dialogue
            async open(files) {
                Vue.$log.info("files to be opened:")
                Vue.$log.info(files)
                this.dialog = true
                let count = 0
                while(!this.$refs.desktopmanager && count < 10){
                    await new Promise(r => setTimeout(r, 5000))
                    count = count + 1
                }
                if(this.$refs.desktopmanager) {
                    this.$refs.desktopmanager.setFiles(files)
                    // start timer
                    this.$refs.desktopmanager.startTimer(15000)
                }
            },
            agree() {
                Vue.$log.info("agree")
                this.dialog = false
                // stop timer
                if(this.$refs.desktopmanager) {
                    this.$refs.desktopmanager.stopTimer()
                }
            },
            cancel() {
                Vue.$log.info("cancel")
                this.dialog = false
                // stop timer
                if(this.$refs.desktopmanager) {
                    this.$refs.desktopmanager.stopTimer()
                }
            },


        },
    }
</script>
<style>
</style>