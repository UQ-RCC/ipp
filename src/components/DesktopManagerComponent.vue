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
                <div align="center" justify="center" style="overflow: auto; height:300px;">
                    <v-list-item v-for="(afile,index) in files" :key="index">
                        <v-list-item-title>{{ afile }}</v-list-item-title>
                        <v-list-item-action>
                            <v-btn icon @click="removeItem(index)">
                                <v-icon>mdi-close</v-icon>
                            </v-btn>
                        </v-list-item-action>
                    </v-list-item>
                </div>

            </v-list-group>
        </div>

        <div v-if="desktopManagerOnly===false">
            <v-card-title align="start" justify="center">
                Select a program to open selected files
            </v-card-title>
            <v-row v-if="!isInScratch" align="center" justify="center">
                <v-checkbox
                    v-model="copyFilesToScratch"
                    label="Copy files to scratch"
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
                        
                    >
                    </v-select>
                </v-col>
                <v-btn class="my-1" color="success" rounded dark large 
                        @click="launchProgram" 
                        > 
                        Open Program
                </v-btn>
            </v-row>
        </div>

        <div >
            <v-card-title align="start" justify="center">
                Launch a desktop
            </v-card-title>
            <v-row v-if="desktopManagerOnly===true" align="center" justify="center" class="mx-3">
                <!-- <v-col cols="2" sm="1" md="2" lg="2">
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
                </v-col> -->

                <v-col cols="6" sm="3" md="4" lg="4">
                                
                    <div>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-select v-on="on" v-bind="attrs"
                                    :items="OODdesktops"
                                    v-model="selectedDesktop"
                                    item-text="label"
                                    label="Desktop"
                                    return-object
                                >
                                </v-select>
                            
                            </template>
                            <span>Select a desktop to launch</span>
                        </v-tooltip>
                    </div>
                </v-col>
                        
                <v-col cols="4" sm="3" md="4" lg="4">
                    <v-btn class="my-1" color="success" rounded dark large @click="launchDesktop"> 
                        Launch Desktop
                </v-btn>
                </v-col>
            </v-row>
            <!-- <v-row v-if="desktopManagerOnly===true" align="center" justify="center" class="mx-3">
                <v-col cols="8" sm="4" md="8" lg="8">
                    <v-data-table
                        :headers="desktopConfigHeader"
                        :items="[{nodes: 1, ppn: selectedFlavour.cpu, mem: selectedFlavour.ram, gpu: selectedFlavour.gpu, gpuram: selectedFlavour.gpuram}]"
                        class="elevation-1"
                        hide-default-footer
                        >
                    </v-data-table>
                </v-col>                    
            </v-row> -->
            <v-row v-if="desktopManagerOnly===false" align="center" justify="center" class="mx-5">
                <v-btn class="my-1" color="success" rounded dark large @click="launchIPPDesktop"> 
                        Launch IPP Desktop
                </v-btn>
            </v-row> 

        </div>         

        <!-- <div v-if="desktops.length > 0">
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
                            </template>
                    </v-data-table>
                </v-col>
            </v-row>
        </div> -->

        
        <v-card-actions>
            <v-row align="center" justify="center"> 
                <v-btn class="my-1" color="success" rounded dark large 
                    @click="openDesktop" 
                    :disabled="currentDesktop === null"> 
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
                selectedDesktop:"",
                selectedFlavour: {},
                walltime: 4, 
                copyFilesToScratch: true,
                isInScratch: false,
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
                ],
                OODdesktops: [
                    {label:'GPU-Accelerated Desktop', value:'viz_desktop'},
                    {label:'Standard Desktop', value:'std_desktop'},
                    {label:'Expert Desktop', value:'adv_desktop'},
                    {label:'IPP Accelerated Desktop', value:'ipp_desktop'},

                ]           
             }
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
                } else {
                    this.currentDesktop = null
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
                console.log( this.apps)
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
                Vue.$log.info(item)
                this.loading = true
                await DesktopAPI.stop_desktop(item.jobid)
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
                /* if(this.currentDesktop === null) {
                    Vue.$log.info("No desktop running. exit!!!")
                    return
                } */
                Vue.$log.info(this.selectedApp)
                this.loading = true
                // get display number
                //let vncDisplayRes = await DesktopAPI.vncdisplay()
               // Vue.$log.info("vnc display:" + Number(vncDisplayRes.commandResult[0].vncDisplay))
               // let displayNumber = Number(vncDisplayRes.commandResult[0].vncDisplay)
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
                console.log("parameters for launch app")
                //this.currentDesktop.node='gpunode-2-0'
                console.log(this.selectedApp)
               // console.log(displayNumber)
                console.log(btoa(filesList))
                //console.log(this.copyFilesToScratch)
                await DesktopAPI.launchapp(this.selectedApp, filesList, this.copyFilesToScratch)
                this.loading = false
            },
            

            // create a new desktop
            async launchIPPDesktop(){
                
                this.loading = true
                window.open('https://bunya-ondemand.rcc.uq.edu.au/pun/sys/dashboard/batch_connect/sys/ipp_desktop/session_contexts/new', '_blank');
                //await DesktopAPI.start_desktop(this.selectedFlavour.ram, this.selectedFlavour.cpu, this.walltime)
                // sleep for 5 seconds
                //await new Promise(r => setTimeout(r, 5000))
                //await this.getDesktops()
                this.loading = false
            },

            async launchDesktop(){
                console.log("selectedDesktop")
                console.log(this.selectedDesktop.value)
                this.loading = true
                window.open('https://bunya-ondemand.rcc.uq.edu.au/pun/sys/dashboard/batch_connect/sys/'+this.selectedDesktop.value+'/session_contexts/new', '_blank');
                //await DesktopAPI.start_desktop(this.selectedFlavour.ram, this.selectedFlavour.cpu, this.walltime)
                // sleep for 5 seconds
                //await new Promise(r => setTimeout(r, 5000))
                //await this.getDesktops()
                this.loading = false

            },

            // set files
            setFiles(filelist) {
                console.log("setFiles ")
                console.log(filelist)
                if(filelist.length>0){
                    filelist.map(item => {
                    if(!item.endsWith("/") && !this.files.includes(item)){
                        this.files.push(item)
                        console.log("a file")
                    } else {
                        console.log("a folder")
                    }
                })
                    
                } 
                console.log("before this.isInScratch")
                console.log(this.isInScratch)
                if (filelist.every(file => file.startsWith('/scratch'))){
                    this.isInScratch = true
                }else {
                    this.isInScratch = false
                } 
                console.log("after this.isInScratch")
                console.log(this.isInScratch)
            
                //this.files = filelist
            },
            removeItem(index) {
                this.files.splice(index,1)

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
           // this.getDesktops()
            this.getApps()
            this.getFlavours()
            //this.startTimer(20000)
            this.loading = false
            console.log("this.desktopManagerOnly")
            console.log(this.desktopManagerOnly)
        },
        
        destroyed() {
            this.stopTimer()
        },
    }
</script>
<style>
</style>