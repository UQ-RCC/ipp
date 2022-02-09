<template>
    <v-card max-height="100%" max-width="99%">
        <br />
        <v-progress-linear
            color="primary accent-4"
            indeterminate
            rounded
            height="4"
            :active="loading"
        ></v-progress-linear>
        
        <div align="center" justify="center" v-if="desktopManagerOnly===false && files.length >0">
            <v-list-group :value="true" no-action>
                <template v-slot:activator>
                    <v-card-title>
                        Selected files
                    </v-card-title>
                </template>

                <v-list-item v-for="afile in files" :key="afile">
                    <v-list-item-title>{{ afile }}</v-list-item-title>
                </v-list-item>
            </v-list-group>
        </div>

        <div v-if="desktops.length === 0">
            <v-card-title align="start" justify="center">
                Launch a desktop
            </v-card-title>
            <v-row align="center" justify="center" class="mx-3">
                <v-col cols="2" sm="1" md="2" lg="2">
                    <v-select
                        :items="flavours"
                        v-model="selectedFlavour"
                        item-text="type"
                        label="Flavour"
                        return-object
                    >
                    </v-select>
                </v-col>
                <v-col cols="2" sm="1" md="2" lg="2">
                    <v-text-field 
                        v-model="walltime"
                        regular
                        type="number"
                        :rules="numberRules" 
                        label="Time (hours)">
                    </v-text-field>
                </v-col>
            </v-row>
            <v-row align="center" justify="center" class="mx-3">
                <v-col cols="8" sm="4" md="8" lg="8">
                    <v-data-table
                        :headers="desktopConfigHeader"
                        :items="[{nodes: 1, ppn: selectedFlavour.cpu, mem: selectedFlavour.ram, gpu: selectedFlavour.gpu, gpuram: selectedFlavour.gpuram}]"
                        class="elevation-1"
                        hide-default-footer
                        >
                    </v-data-table>
                </v-col>                    
            </v-row>
            <v-row align="center" justify="center" class="mx-5">
                <v-btn class="my-1" color="success" rounded dark large :disabled="flavours.length == 0" @click="launchDesktop"> 
                    Launch Desktop
                </v-btn>
            </v-row>

        </div>            

        <div v-if="desktops.length > 0">
            <v-card-title align="start" justify="center">
                Running Desktops
            </v-card-title>
            <v-row align="center" justify="center" class="mx-3">
                <v-col cols="45" sm="11" md="13">
                    <v-data-table
                        :headers="runningDesktopsTableHeaders"
                        :items="[{jobid: currentDesktop.jobid, status: currentDesktop.status, usedTime: currentDesktop.usedTime, jobName: currentDesktop.jobName, username: currentDesktop.uname}]"
                        class="elevation-1"
                        hide-default-footer
                        v-if="currentDesktop"
                        >
                            <template v-slot:item.actions="{ item }">
                                <v-icon
                                    class="mx-3"
                                    color="warning" 
                                    title="Stop desktop"
                                    @click="deleteDesktop(item)"
                                >
                                    mdi-delete
                                </v-icon>
                                <v-icon
                                    class="mx-3"
                                    title="Refresh"
                                    @click="getDesktops()"
                                >
                                    mdi-refresh
                                </v-icon>
                            </template>
                    </v-data-table>
                </v-col>
            </v-row>
        </div>

        <div v-if="currentDesktop !== null && desktopManagerOnly===false && currentDesktop.status =='RUNNING'">
            <v-card-title align="start" justify="center">
                Select a program to open selected files
            </v-card-title>
            <v-row align="center" justify="center">
                <v-checkbox
                    v-model="copyFilesToScratch"
                    label="Copy files to scratch"
                    :readonly="currentDesktop === null"
                ></v-checkbox>
            </v-row>
            <v-row align="center" justify="center">
                <v-col cols="6" sm="4" md="4">
                    <v-select
                        :items="apps"
                        v-model="selectedApp"
                        item-text="displayText"
                        item-value="id"
                        label="App"
                        :readonly="currentDesktop === null"
                    >
                    </v-select>
                </v-col>
                <v-btn class="my-1" color="success" rounded dark large 
                        @click="launchProgram"> 
                        Open Program
                </v-btn>
            </v-row>
        </div>
        <v-card-actions>
            <v-row align="center" justify="center"> 
                <v-btn class="my-1" color="success" rounded dark large 
                    @click="openDesktop" 
                    :disabled="currentDesktop === null || currentDesktop.status !='RUNNING'"> 
                    Show Desktop
                </v-btn>
            </v-row>
        </v-card-actions>
    </v-card>
</template>

<script>
    import Vue from 'vue'
    import DesktopAPI from "@/api/DesktopAPI.js"

    export default {
        name: 'DesktopManagerComponent',
        props: {
            desktopManagerOnly: Boolean
        },
        data() {
            return {
                loading: false,
                files: [],
                timer: null,
                desktops: [],
                currentDesktop: null,
                apps: [],
                flavours: [],
                selectedApp: "",
                selectedFlavour: {},
                walltime: 4, 
                copyFilesToScratch: true,
                runningDesktopsTableHeaders: [
                    {text: 'Job ID', align: 'center', sortable: false, value: 'jobid'},
                    {text: 'State', align: 'center', sortable: false, value: 'status'},
                    {text: 'Used Time', align: 'center', sortable: false, value: 'usedTime'},
                    {text: 'Actions', value: 'actions', sortable: false},
                ],
                desktopConfigHeader: [
                    {text: '#CPUs', align: 'center', sortable: false, value: 'ppn'},
                    {text: 'Total Memory (GB)', align: 'center', sortable: false, value: 'mem'},
                    {text: '#GPU', align: 'center', sortable: false, value: 'gpu'},
                    // {text: 'GPU Memory (GB)', align: 'center', sortable: false, value: 'gpuram'},
                ],
                numberRules: [
                    value => value && value > 0 && Number.isInteger(Number(value)) || 'Must be an positive integer'
                ]            }
        },

        methods: {
            ///////////////////////////////////////
            // list of running desktops
            async getDesktops(){
                let response = await DesktopAPI.list_desktop()
                Vue.$log.debug("Open desktops :")
                Vue.$log.debug(response)
                this.desktops = response.commandResult
                if(this.desktops.length > 0) {
                    this.currentDesktop = this.desktops[0]
                    if (this.currentDesktop.status == 'RUNNING')
                        this.loading = false
                    else
                        this.loading = true
                } else {
                    this.currentDesktop = null
                    this.loading = false
                }
            },
            // list of supported apps
            async getApps(){
                let response = await DesktopAPI.listapps()
                Vue.$log.debug("Supported apps :")
                Vue.$log.debug(response)
                this.apps = []
                response.commandResult.forEach(element => {
                    element.displayText = element.name + " version " + element.version
                    this.apps.push(element)
                    this.selectedApp = this.apps[0].id
                });
            },
            async getFlavours(){
                let response = await DesktopAPI.listdesktopflavours()
                Vue.$log.debug("Supported flavours :")
                Vue.$log.debug(response)
                this.flavours = []
                response.commandResult.forEach(element => {
                    this.flavours.push(element)
                    this.selectedFlavour = this.flavours[0]
                });
            },
            // delete the desktop
            async deleteDesktop(item){
                Vue.$log.info("Deleting ....")
                Vue.$log.info(item)
                this.loading = true
                await DesktopAPI.stop_desktop(item.jobid)
                // await new Promise(r => setTimeout(r, 5000))
                // await this.getDesktops()                
                this.desktops = []
                this.currentDesktop = null
                this.loading = false
            },
            // go to the desktop
            openDesktop(){
                Vue.$log.info("Opening dekstop")
                Vue.$log.info(this.currentDesktop)
                let route = this.$router.resolve({path: '/desktop'})
                let url = route.href + "?desktopid="+ this.currentDesktop.jobid + "&exechost=" + this.currentDesktop.node
                Vue.$log.info(url )
                window.open(url, '_blank')
            },
            // open a program in the selected desktop
            async launchProgram(){
                if(this.currentDesktop === null) {
                    Vue.$log.info("No desktop running. exit!!!")
                    return
                }
                Vue.$log.info(this.selectedApp)
                this.loading = true
                // get display number
                let vncDisplayRes = await DesktopAPI.vncdisplay()
                Vue.$log.info("vnc display:" + Number(vncDisplayRes.commandResult[0].vncDisplay))
                let displayNumber = Number(vncDisplayRes.commandResult[0].vncDisplay)
                //
                let filesToBeLoaded = []
                this.files.map(item => {
                    if(item.endsWith("/")){
                        Vue.notify({
                            group: 'sysnotif',
                            type: 'error',
                            title: 'Opening folder is not supported',
                            text: 'Cannot open: ' + item
                        })
                    } else {
                        filesToBeLoaded.push(item)
                    }
                })
                let filesList = filesToBeLoaded.join(";")
                Vue.notify({
                    group: 'sysnotif',
                    type: 'info',
                    title: this.selectedApp,
                    text: filesList + ' are being loaded to ' + this.selectedApp
                })
                await DesktopAPI.launchapp(this.currentDesktop.node, this.selectedApp, displayNumber, filesList, this.copyFilesToScratch)
                this.loading = false
            },
            

            // create a new desktop
            async launchDesktop(){
                this.loading = true
                await DesktopAPI.start_desktop(this.selectedFlavour.ram, this.selectedFlavour.cpu, this.walltime)
                // sleep for 5 seconds
                await new Promise(r => setTimeout(r, 10000))
                await this.getDesktops()
                // this.loading = false
            },

            // set files
            setFiles(filelist) {
                this.files = filelist
            },

            // start timer
            startTimer(interval) {
                if(!this.timer){
                    this.timer = setInterval(() => {
                        this.getDesktops()
                    }, interval)
                }
            },
            // stop timer
            stopTimer() {
                if(this.timer){
                    clearInterval(this.timer)
                }
            }
        },
        mounted: async function(){
            // get the current desktops
            this.loading = true
            this.getDesktops()
            this.getApps()
            this.getFlavours()
            this.startTimer(7000)
            this.loading = false
        },
        destroyed() {
            this.stopTimer()
        },
    }
</script>
<style>
</style>