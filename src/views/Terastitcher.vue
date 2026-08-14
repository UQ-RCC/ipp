<template>
    <div>
        <v-progress-linear
            color="primary accent-4"
            indeterminate
            rounded
            height="4"
            :active="loading"
        ></v-progress-linear> 
       
        <br />
        <file-browser-dialog ref="filedialog" />
        <!-- <template-dialog ref="templatedialog" /> -->
        
       
        
        
        <!-- main GUI: tables, tabs -->
        <v-row >
            <!-- table and buttons-->
            <v-col  cols="12" sm="12" md="4" lg="4" xl="4">
                <div class="text-center table-area">
                    <v-data-table
                        v-model="selected"
                        :headers="selectedFilesTable.headers"
                        :items="loaded"
                        :single-select="singleSelect"
                        :disable-pagination="true"
                        item-key="path"
                        show-select
                        class="elevation-1"
                        height="250px" width="100%"
                        @item-selected="selectedChanged"
                        
                    >
                    </v-data-table>

                    <div>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn 
                                    class="my-3" 
                                    color="primary" 
                                    style="margin: 5px;"
                                    fab dark default 
                                    @click.stop="selectFiles()"
                                    v-bind="attrs" 
                                    v-on="on">
                                    <v-icon>mdi-file-xml</v-icon>
                                </v-btn>
                            </template>
                            <span>Select from XML</span>
                        </v-tooltip>
                        


                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn 
                                    class="my-3" 
                                    color="primary" 
                                    style="margin: 5px;"
                                    fab dark default 
                                    v-bind="attrs" 
                                    v-on="on"
                                    @click.stop="selectFilesInFolder()">
                                    <v-icon>mdi-folder-plus</v-icon>
                                </v-btn>
                            </template>
                            <span>Select from directory</span>
                        </v-tooltip>

                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn  class="my-3" 
                                        color="warning"
                                        style="margin: 5px;"
                                        @click.stop="removeCurrentlySelected()" 
                                        fab dark default 
                                        v-bind="attrs" 
                                        v-on="on">
                                    <v-icon>mdi-close</v-icon>
                                </v-btn>
                            </template>
                            <span>Remove selected</span>
                        </v-tooltip>

                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn  class="my-3" 
                                        color="error"
                                        style="margin: 5px;"
                                        @click.stop="removeAll()"  
                                        fab dark default 
                                        v-bind="attrs" 
                                        v-on="on">
                                    <v-icon>mdi-close-octagon</v-icon>
                                </v-btn>
                            </template>
                            <span>Remove all</span>
                        </v-tooltip>
                    </div>
                    <div>
                        <v-row class="ml-2 mr-2">
                    <!--  <v-col cols="12"  sm="12" md="4" lg="4" xl="4"> -->

                    <v-text-field label="Output Base Path" hide-details="auto" v-model="outputBasePath" @change="outputPathChanged" ></v-text-field>
                    <!-- </v-col> -->

                </v-row>

                <v-row class="ml-2 mr-2">


                    <v-text-field label="Output Folder Name" hide-details="auto" v-model="outputFolderName" @change="outputPathChanged" ></v-text-field>

                </v-row>
                <v-row>
                    <v-col>
                        <v-btn class="mx-1" color="primary" @click.stop="chooseOutputFolder" rounded dark large
                            title="Select where to save the outputs">
                            Choose Output Folder
                        </v-btn>
                    </v-col>
                    <v-col>
                        <v-btn class="mx-1" color="primary" title="Browse output folder in a new Window"
                            @click.stop="openOutputFolder" fab medium :disabled="!outputBasePath && !outputFolderName">
                            <v-icon>mdi-open-in-app</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
                    </div>
                    <div >
                        <v-row v-if="completedStep !== null" class="ml-2 mr-2">

                            <p><bold> {{ completedStep }} step has been completed. You can proceed to the next step.</bold></p>
                        </v-row>
                        <v-row v-if="message !== null" class="ml-2 mr-2">

                            <p><bold> {{message}}</bold></p>

                        </v-row>
                      <!--   <v-row>
                             <v-card outlined tile class="pa-2" style="margin: 5px; width: 100%; height: 100px">
                                <v-card-title>Saved xmls in the folder</v-card-title>
                                <v-card-text>
                                    <li v-for="(xml, index) in xmlFiles" :key="index">
                                        {{xmlFiles[index]}}
                                    </li>
                                </v-card-text>

                             </v-card>

                        </v-row> -->
                    </div>
                    
                </div>

            </v-col>
            <v-divider vertical></v-divider>
            <v-col cols="12" sm="12" md="8" lg="8" xl="8" style="height:1400px">
                    <v-row class="d-flex" v-bind:style="{height: '70%',margin:'10px'}" v-on:keyup.right="nextStep">
                        <v-stepper non-linear outlined v-model="currentStep"  v-bind:style="{width: '100%'}"  @change="stepChanged" >
                            <v-stepper-header>
                                <v-stepper-step v-for="(step, n) in steps" :key="n" :complete="stepComplete(n + 1)" :step="n + 1"
                                    :color="stepStatus(n + 1)" :editable="checkStepVisibility(n + 1)"  @click="stepClicked">
                                    {{ step.name }}
                                </v-stepper-step>
                            </v-stepper-header>

                            <v-stepper-items>
                            
                                <v-stepper-content step=1>
                                    <terastitcher-import ref="teraimport"/>
                                </v-stepper-content>

                                <v-stepper-content step=2>
                                    <terastitcher-align ref="teraalign"/>
                                </v-stepper-content>

                                <v-stepper-content step=3>
                                    <terastitcher-project ref="teraproject"/>
                                </v-stepper-content>

                                <v-stepper-content step=4>
                                    <terastitcher-threshold ref="terathreshold"/>
                                </v-stepper-content>

                                <v-stepper-content step=5 >
                                    <terastitcher-place ref="teraplace" />
                                </v-stepper-content>

                                <v-stepper-content step=6>
                                    <terastitcher-merge ref="teramerge"/>
                                </v-stepper-content>
                                
                                <!-- <v-stepper-content step=7>
                                    <terastitcher-devices ref="teradevices"/>
                                </v-stepper-content>

                                <v-stepper-content step=8>
                                    <terastitcher-review ref="terareview"/>
                                </v-stepper-content> -->

                                
                            </v-stepper-items>
                        </v-stepper>
                    </v-row>
                    <div class="buttons-margin"/>
                    <div class="buttons-extra-margin" v-if="workingItem && currentStep== 6"/>
                    <v-row class="d-flex" v-bind:style="{margin:'10px'}" >
                        <v-tooltip top >
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn fab dark small color="primary" 
                                        @click.stop="previousStep" v-bind="attrs" v-on="on">
                                    <v-icon dark>
                                        mdi-chevron-left
                                    </v-icon>
                                </v-btn>
                            </template>
                            <span>Previous step</span>
                        </v-tooltip>
                        
                        <v-spacer></v-spacer>

                        
                        
                        <v-spacer></v-spacer>
                        
                      <!--   <v-spacer></v-spacer>
                        <v-tooltip top>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn 
                                    color="primary" rounded dark default 
                                    v-bind="attrs" v-on="on"
                                    :disabled="selected.length === 0"
                                    @click.stop="submitSelected()">
                                        Submit Selected
                                </v-btn>
                            </template>
                            <span>Submit the selected series/files</span>
                        </v-tooltip>
                        <v-spacer></v-spacer> -->

                        <!-- <v-tooltip top>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn 
                                    color="primary" rounded dark default 
                                    v-bind="attrs" v-on="on"
                                    :disabled="selected.length === 0"
                                    @click.stop="submitAll()">
                                        Submit All
                                </v-btn>
                            </template>
                            <span>Submit all the series/files</span>
                        </v-tooltip>
 -->
                
                        <!-- <div class="flex-grow-1"></div> -->
                        <v-spacer></v-spacer>
                        <v-tooltip top>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn fab dark small color="primary" 
                                        @click.stop="nextStep" v-bind="attrs" v-on="on" >
                                    <v-icon darkd>
                                        mdi-chevron-right
                                    </v-icon>
                                </v-btn>
                            </template>
                            <span>Next step</span>
                        </v-tooltip>
                    </v-row>
                    <p />
                

            </v-col>
        </v-row>   
    </div>    
</template>

<script>
    import Vue from 'vue'
    // import * as api from '@/api'
    import FileBrowserDialog from '@/components/FileBrowserDialog.vue'
    //import TerastitcherDevices from '@/components/terastitcher/Devices.vue'
    //import TerastitcherReview from '@/components/terastitcher/Review.vue'
    //import TemplateDialog from '@/components/TemplateDialog.vue'
    //import MetadataDialog from '@/components/MetadataDialog.vue'
    import TerastitcherImport from '@/components/terastitcher/Import.vue'
    import TerastitcherAlign from '@/components/terastitcher/Align.vue'
    import TerastitcherProject from '@/components/terastitcher/Project.vue'
    import TerastitcherThreshold from '../components/terastitcher/Threshold.vue'
    import TerastitcherPlace from '../components/terastitcher/Place.vue'
    import TerastitcherMerge from '../components/terastitcher/Merge.vue'
    
    // api
    
    //import ConfigurationAPI from "@/api/ConfigurationAPI.js"
    import PreferenceAPI from '../api/PreferenceAPI'
    
    import miscs from '@/utils/miscs.js'
    //import FilesAPI from "@/api/FilesAPI"

    import VueCookies from 'vue-cookies'
import TerastitcherAPI from '../api/TerastitcherAPI.js'

    Vue.use(VueCookies)

    export default {
        name: 'Terastitcher',
        components: {
            FileBrowserDialog,
           // TerastitcherDevices,
           // TerastitcherReview,
            //TemplateDialog,
            TerastitcherImport,
            TerastitcherAlign,
            TerastitcherProject,
            TerastitcherThreshold,
            TerastitcherPlace,
            TerastitcherMerge
            
        },
       
        data() {
            return {
                validityDialog: false,
                singleSelect: true,
                loading: false,
                overlay:false,
                fileBrowserDialog: false,
                fileBrowserDialogMode: '',
                selectedColor:null,
                isSame: false,
                tempID: null,
                outputpath:[],
                path:[],
                mloading:false,
                dateTime:"",
                selectedtag: null,
                filepath: [],
                metadataLoaded:false,
                deconTool:'',
                outputBasePath: "",
                outputFolderName: "",
                completedStep: null,
                message: "",
                
                
                // -- selected files table
                selectedFilesTable: {
                    headers: [
                        { text: 'Import', value: 'path' }
                    ],
                },
                

               

                rules: {
                    // TODO: some how simplify this
                    importstepvalid: () => {
                        return this.checkStepValidity(1, this.$refs.teraimport)
                    },
                    alignstepvalid: () => {
                        return this.checkStepValidity(2, this.$refs.teraalign)
                    },
                    projectstepvalid: () => {
                        return this.checkStepValidity(3, this.$refs.teraproject)
                    },
                    thresholdstepvalid: () => {
                        return this.checkStepValidity(4, this.$refs.terathreshold)
                    },
                    placestepvalid: () => {
                        return this.checkStepValidity(5, this.$refs.teraplace)
                    },
                    mergestepvalid: () => {
                        return this.checkStepValidity(6, this.$refs.teramerge)
                    },
                     devicesstepvalid: () => {
                        return this.checkStepValidity(7, this.$refs.teradevices)
                    }

                },
                // item to be displayed at UI
                workingItem: {},
                visitedSteps: [],
                currentStep:1,
                // selected items
                selected: [],
                // loadedItems
                loaded: [],
                steps: [
                { name: "Import" , rules: [v => !!v || "Input file details"], valid: true},
                { name: "Align", valid: true },
                { name: "Project", valid: true },
                { name: "Threshold", valid: true },
                { name: "Place", valid: true },
                { name: "Merge",  valid: true }
               /*  { name: "Device",  valid: true },
                { name: "Review" }, */

            ],
            }
        },
        mounted: async function() {
            let today = new Date();
            let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
            let time = today.getHours() + "-" + today.getMinutes() + "-" + today.getSeconds();
            this.dateTime = date+'_'+time;
            this.loading =true
            try{
                
                let teraRecord = await PreferenceAPI.get_tera(null)
                console.log("teraRecord", teraRecord)
                if(teraRecord) {
                    const record = {

                        id: teraRecord.id,
                        path: teraRecord.isfolder ? teraRecord.volumePath : teraRecord.xmlPath,
                        setting: teraRecord 
                    }
                    this.loaded = [record]
                    this.selected = [record]
                    this.workingItem = { ...record }
                    this.workingItem.setting = teraRecord
                }else {
                    // fresh start - no existing record, nothing to load
                    this.loaded = []
                    this.selected = []
                    this.workingItem = { setting: {} }
                }
                // output path
                // output path
                const existingOutputPath = teraRecord && teraRecord.outputPath ? teraRecord.outputPath : ""
                this.workingItem.outputPath = existingOutputPath
                
                var _pathParts = teraRecord.outputPath.split("/")
                this.outputBasePath = _pathParts.slice(0, -1).join("/")
                this.outputFolderName = "Stitch_Output_"+ this.dateTime
                console.log("this.outputFolderName- tera", this.outputFolderName)
                this.outputPathChanged()
                

                console.log(this.currentStep)

                let _component = this.getStepComponent(this.currentStep)
                if (_component) {
                    console.log("_component")
                    console.log(_component)
                    //this.workingItem.setting.filepath = this.selected[0].series.path
                    console.log(this.workingItem)
                    _component.load_serie(this.workingItem, this.workingItem.setting.isfolder)
                }
                

                
                console.log(this.loaded)
                console.log(this.selected)
                console.log("initial")
                console.log(this.workingItem)
            }catch(e) {
                Vue.$log.warn("No existing tera records found:", e)
                // still treat as fresh start on unexpected error
                this.loaded = []
                this.selected = []
                this.workingItem = { setting: {}, outputPath: "" }
                this.outputBasePath = ""
                this.outputFolderName = "Stitch_Output_" + this.dateTime
            } finally {
                this.loading = false
            }

        },
        methods: {

            extractJson(lines) {
                const outputs = lines.map(item => item.output);

                let start = -1;
                let depth = 0;
                const jsonLines = [];

                for (let i = 0; i < outputs.length; i++) {
                    const line = outputs[i];

                    if (start === -1) {
                    // look for the line that kicks off the JSON block
                    if (line.trim().startsWith('{')) {
                        start = i;
                    } else {
                        continue;
                    }
                    }

                    jsonLines.push(line);

                    // track brace depth to know when the object closes
                    for (const ch of line) {
                    if (ch === '{') depth++;
                    if (ch === '}') depth--;
                    }

                    if (start !== -1 && depth === 0) {
                    break; 
                    }
                }

                const jsonString = jsonLines.join('\n');
                return JSON.parse(jsonString);
            },
            
            
            stepComplete(step) {
                return this.workingItem.step > step
            },
            stepStatus(step) {
                return this.workingItem.step > step ? 'green' : 'blue'
            },
            
        
        async saveSettings() {
            console.log("this.selected")
            console.log("saveSettings")
            console.log(this.selected)
            console.log(this.workingItem.setting)
            console.log(this.outputBasePath, this.outputFolderName)
            for (const tera of this.selected) {
                const payload = {
                    ...this.workingItem.setting,
                    outputBasePath: this.outputBasePath,
                    outputFolderName: this.outputFolderName,
                    outputPath: this.outputBasePath + "/" + this.outputFolderName,
                    step: this.workingItem.step,
                    visitedSteps: this.visitedSteps
                }
                console.log("tera.id")
                console.log(tera.id)
                if (tera.id) {
                    // Update existing record
                    await PreferenceAPI.update_tera(tera.id, payload)
                }
            }
        },

        getStepNumber(stepName) {
            const stepMap = {
            import: 1,
            align: 2,
            project: 3,
            threshold: 4,
            place: 5,
            merge: 6
            }

            return stepMap[stepName?.toLowerCase()] || null
        },
           
             
        async chooseOutputFolder() {
            let options = await this.$refs.filedialog.open('selectfolder', 'Terastitcher', '/')
             this.xmlFiles = []
            if (!options.cancelled && options.path) {
                var selectedFolder = options.path
                Vue.$log.debug("selected folder:" + selectedFolder)
                if (selectedFolder.endsWith('/'))
                    selectedFolder = selectedFolder.slice(0, -1)
                var _pathParts = selectedFolder.split("/")
                this.outputBasePath = _pathParts.slice(0, -1).join("/")
                this.outputFolderName = _pathParts.slice(-1)[0]
                let outputPath = this.outputBasePath +"/" + this.outputFolderName
                console.log("outputPath")
                this.saveSettings()
                let response = await TerastitcherAPI.get_step_xmls(outputPath)
                if(response && response.commandResult.length > 0 ) {
                    let output = response.commandResult
                    let json_output = this.extractJson(output)
                    console.log("json_output", json_output)
                    let mdata = json_output.mdata
                    let current_step = json_output.current_step
                    console.log("input_path", mdata)
                    console.log("current_step", current_step)
                    let input_path = mdata.xmlPath != null ? mdata.xmlPath : mdata.volumePath
                    console.log("selected_path", this.selected[0].path)
                    console.log("input_path", input_path)
                    if (input_path == this.selected[0].path ) {
                        console.log("input path matches selected path")
                        this.message = ""
                        if (current_step != 'merge'){

                            const capitalize = str => str ? str[0].toUpperCase() + str.slice(1) : str;

                            this.completedStep = capitalize(current_step)
                            this.currentStep = this.getStepNumber(current_step) +1
                            let _component = this.getStepComponent(this.currentStep)
                            if (_component){
                                console.log("this.workingItem.setting")
                                if (current_step == 'import'){
                                    Vue.set(mdata, 'importStatus', 'completed')
                                    let import_json = json_output.steps.import.result
                                    TerastitcherImport.updateinfo(import_json)
                                    console.log("import_json", import_json)
                                }else if (current_step == 'align'){
                                    Vue.set(mdata, 'alignStatus', 'completed')
                                    let align_json = json_output.steps.align.result
                                    
                                    Vue.set(mdata, 'project_displacements', align_json.displacement_total)
                                    Vue.set(mdata, 'project_ppdisplacements', align_json.displacement_per_stack_pair)
                                    
                                }else if (current_step == 'project'){
                                    Vue.set(mdata, 'projectStatus', 'completed')
                                    let project_json = json_output.steps.project.result
                                    console.log("project_json", project_json)
                                }else if (current_step == 'threshold'){
                                    Vue.set(mdata, 'thrsStatus', 'completed')
                                    let threshold_json = json_output.steps.threshold.result
                                    console.log("threshold_json", threshold_json)
                                }else if (current_step == 'place'){
                                    Vue.set(mdata, 'placeStatus', 'completed')
                                    let place_json = json_output.steps.place.result
                                    
                                    Vue.set(mdata, 'placedim_d', place_json.dim_d)
                                    Vue.set(mdata, 'placedim_h', place_json.dim_h)
                                    Vue.set(mdata, 'placedim_v', place_json.dim_v)

                                    console.log("place_json", place_json)
                                }

                                this.workingItem.setting = mdata
                                console.log(this.workingItem.setting)
                                _component.load_serie(this.workingItem.setting)
                            }
                        }

                    }else {
                        this.message = "The selected output folder does not match the selected input series. Please select the correct output folder."
                    }
                   
                    
                    
                   /*  for(let i = 0; i < output.length; i++) {
                        this.xmlFiles.push(output[i].output)
                    } */
                }
           /*  console.log("response xml listing") */
           /*  console.log(this.xmlFiles) */
            }
        },
        


        // open folder
        async openOutputFolder() {
            if (this.outputBasePath && !this.outputBasePath.endsWith("/"))
                this.outputBasePath = this.outputBasePath + "/"
            let outputPath = this.outputBasePath + this.outputFolderName
            if (!outputPath.endsWith("/"))
                outputPath = outputPath + "/"
            let route = this.$router.resolve({ path: '/' })
            let url = route.href + "?component=filesmanager&path=" + outputPath
            Vue.$log.info(url)
            window.open(url, '_blank')
            
        },

          

            /**
             * a common function; to be called by selectFiles, selectFilesInFolders
             */
            async selectFilesOrFolders(isfolder){
                
               
                let options = null
                
                
                if (isfolder)
                    options = await this.$refs.filedialog.open('selectfilesinfolder', 'Terastitcher', '/',false )
                else
                    options = await this.$refs.filedialog.open('selectfiles', 'Terastitcher', '/', false)
                
                if (!options.cancelled) {
                    let paths = []
                    if(isfolder){
                        let _pathToBeLoaded = options.path 
                        let _pathFilter = options.filter
                        Vue.$log.debug("selecting series:" + _pathToBeLoaded + "max size" + options.maxsize)
                        let _exist = false
                        this.loaded.map(file => {
                            if (file.path === _pathToBeLoaded)
                                _exist = true
                        })
                        if (_exist)
                            return
                        
                        if(options.maxsize * 2.2 > miscs.maxMemSize()){
                            Vue.notify({
                                group: 'sysnotif',
                                type: 'warning',
                                title: 'Unable to add file',
                                text: 'This series require too much memory to run! This series cannot be added'
                            })
                            return
                        }
                        paths.push({ 'path': _pathToBeLoaded, 'size': options.maxsize, 'filter' : _pathFilter })
                        
            
                    } else {
                        Vue.$log.debug("selecting files:")
                        Vue.$log.debug(options.selectedItems)
                        console.log(this.loaded)
                        
                        for(let i = 0; i< options.selectedItems.length; i++){
                            let _exists = false
                            this.loaded.map(file => {
                                if (file.path === options.selectedItems[i].path)
                                   _exists = true
                               
                                
                            })
                            if (!_exists) {

                                let itemSize = miscs.convertFormattedStrToBytes(options.selectedItems[i].size)
                                
                                if(itemSize * 2.2 > miscs.maxMemSize()){
                                    Vue.notify({
                                        group: 'sysnotif',
                                        type: 'warning',
                                        title: 'Unable to add file',
                                        text: 'This series require too much memory to run! This series cannot be added'
                                    })
                                    return
                                }
                                paths.push({ 'path': options.selectedItems[i].path, 'size': itemSize })
                            }
                            
                        }
                         console.log("loaded file")
                        console.log( this.loaded)
                    }
                    // if paths empty return
                    if(paths.length === 0) {
                        Vue.$log.debug("Paths is empty. Return.")
                        return
                    }
                    else {
                        Vue.$log.debug("Paths is not empty. Start loading.")
                        Vue.$log.debug(paths)
                    }
                     
                    console.log("loaded file")
                    console.log( this.loaded)
                    /* if (this.loaded.length === 0) {
                        this.outputFolderName = "Stitch_Output_"+ this.dateTime
                        this.outputBasePath = paths[0].path.split("/").slice(0, -1).join("/")
                        
                    } */
                    if (this.loaded.length === 0) {
                        this.outputFolderName = "Stitch_Output_"+ this.dateTime
                        let _cleanPath = paths[0].path.endsWith('/') ? paths[0].path.slice(0, -1) : paths[0].path
                        this.outputBasePath = _cleanPath.split("/").slice(0, -1).join("/")
                    }
                    this.loaded = this.loaded.concat(paths)

                    //save new record to db

                    for (const newPath of paths) {
                        try{
                            let existingRecord = await PreferenceAPI.get_tera(newPath.path)
                            /* if (Array.isArray(existingRecord)) {
                                existingRecord = existingRecord.length > 0 ? existingRecord[0] : null
                            } */

                            const match = this.loaded.find(f => f.path === newPath.path)
                            if (existingRecord && existingRecord.id) {
                                // same user already has a record for this exact path -- reuse it
                                Vue.$log.debug("Reusing existing tera record for path:", newPath.path, existingRecord)
                                if (match) {
                                    match.setting = existingRecord
                                    match.setting.id = existingRecord.id
                                    this.loaded.id = existingRecord.id
                                }
                            }else {

                                const payload = {
                                    isfolder: isfolder,
                                    xmlPath: isfolder ? null : newPath.path,
                                    volumePath: isfolder ? newPath.path : null,
                                    outputBasePath: this.outputBasePath,
                                    outputFolderName: this.outputFolderName,
                                    outputPath: this.outputBasePath + "/" + this.outputFolderName,
                                    step: 1,
                                    visitedSteps: []
                                }
                                const created = await PreferenceAPI.create_new_tera(payload)
                                if (match) {
                                    //match.id = created.id
                                    match.setting = payload
                                    match.setting.id = created.id
                                    this.loaded.id = created.id
                                }
                            }
                        } catch(e) {
                            Vue.$log.error("Failed to create tera record:", e)
                        }
                    }
                    
                    if ((!this.selected || this.selected.length == 0) && this.loaded.length > 0) {
                        this.selected = [this.loaded[0]]
                    }

                    this.workingItem = {...this.selected[0]}
                    this.workingItem.setting = this.selected[0].setting
                    this.workingItem.outputPath = this.outputBasePath + "/"+ this.outputFolderName
                    this.workingItem.setting.outputPath = this.workingItem.outputPath
                    console.log("inside folder load")
                    console.log(this.currentStep)
                    console.log(this.workingItem.step)
                    if(this.currentStep == null && this.workingItem.step ==null) {
                        this.workingItem.step = 1
                        this.currentStep = 1
                    }else {
                         this.workingItem.step = this.currentStep
                    }
                    if(this.currentStep == 1) {

                        let _component = this.getStepComponent(this.currentStep)
                        if (_component) {
                            console.log(_component)
                            //this.workingItem.setting.filepath = this.selected[0].series.path
                            console.log(this.workingItem)
                            console.log("file load func")
                            _component.load_serie(this.workingItem, isfolder)
                        }
                    }
            

                    console.log("workingItem")
                    console.log(this.workingItem )

                }
                
            },
             

            /**
             * called when select single files
             */
            async selectFiles(){
                await this.selectFilesOrFolders(false)
                this.workingItem.isfolder=false
            },
            /**
             * select series
             */
            async selectFilesInFolder(){
                await this.selectFilesOrFolders(true)
                this.workingItem.isfolder=true
                
            },

            

            async removeCurrentlySelected() {
                Vue.$log.info("Removing currently seleced item")
                this.selected.forEach(item => {
                    for (let i = 0; i < this.loaded.length; i++) {
                        if (this.loaded[i].path === item.path) {
                            this.loaded.splice(i, 1)
                        }
                    }
                })
                this.selected = []
                if (this.loaded.length == 0) {
                    this.outputFolderName = ""
                    this.outputBasePath = ""
                }
                
            },
        // remove all
            async removeAll() {
                this.loaded = []
                this.selected = []
                this.outputFolderName = ""
                this.outputBasePath = ""
            },


            /**
             * delete all series
             */
        /*     removeAll(){
                // delete all decons
                for(let i = 0; i < this.loaded.length; i++){
                    PreferenceAPI.delete_decon(this.loaded[i].id)
                    
                }
                this.loaded = []
                this.selected = []
                this.outputpath = []
                this.workingItem = series.defaultDecon()
                
                this.display_decon(this.workingItem, false)
                this.metedataResults = []
                this.csvlocation = null
                this.saveMetaToSession()
                
                
            }, */
            /* end part dealing with load */
            /****************************************************************************** */



            /****************************************************************************** */
            /** submit job */
            async submitSingleJob(item){

                
               /* let _numberOfJobs = parseInt(item.setting.instances)
                let _jobs = await PreferenceAPI.create_decon_jobs(item.id, _numberOfJobs)
                 let _jobIds = _jobs.map(_job => {
                    return _job.id
                }) */

                console.log("workingItem")
                console.log(this.workingItem)
                console.log(item)
                
                
               /*  try{
                    if (_current_api &&  _current_api.apiname=="Microvolution") {
                        await DeconvolutionAPI.execute_microvolution(item.setting.outputPath, _numberOfJobs, 
                                        item.setting.mem, item.setting.gpus, item.setting.walltime, item, _jobIds, false, false, false)
                    } else if(_current_api &&  _current_api.apiname=="CudaDecon") {
                        await DeconvolutionAPI.execute_microvolution(item.setting.outputPath,_numberOfJobs, item.setting.mem, item.setting.gpus, item.setting.walltime, item, _jobIds, false, false, true)
                    }
                    Vue.notify({
                        group: 'datanotif',
                        type: 'success',
                        title: 'Submission',
                        text: item.series.path + ' :jobs sent',
                        closeOnClick: true,
                        duration: 5000,
                    })
                    
                }
                catch(err) {
                    Vue.$log.error("-----error submittin-----------")
                    Vue.$log.error(err)
                    await PreferenceAPI.delete_decon_jobs(_jobs)
                    Vue.notify({
                        group: 'datanotif',
                        type: 'error',
                        title: 'Submission',
                        text: item.series.path + ' :fail to send jobs, please try again',
                        closeOnClick: true,
                        duration: 10000,
                    })
                    
                } */
            },
            /**
             * submit all the series
             * when this is called, it means all series are valid
             */
            async submitAll(){
                /* for (let i=0; i< this.loaded.length; i++) {
                    if (!this.loaded[i].setting.valid) {
                        this.validityDialog = true
                        return
                    }
                } */
                for (let i = 0; i < this.loaded.length; i++) {
                    await this.submitSingleJob(this.loaded[i])
                }
            },
            /**
             * submit selected
             */
            async submitSelected(){
                if(this.selected.length === 0)
                    return
               /*  for (let i=0; i< this.selected.length; i++) {
                    if (!this.selected[i].setting.valid) {
                        this.validityDialog = true
                        return
                    }
                } */
                for (let i = 0; i < this.selected.length; i++) {
                    await this.submitSingleJob(this.selected[i])
                }
            },

            /****************************************************************************** */



            /****************************************************************************** */
            /**
             * save template to databsae: save the working one
             */
            /* async saveTemplate(){
                let options = await this.$refs.templatedialog.open(true, this.workingItem)
                if (!options.cancelled) {
                    if(options.success)
                        Vue.notify({
                            group: 'datanotif',
                            type: 'info',
                            title: 'Save Template',
                            text: 'Successfully save template'
                        })
                    else 
                        Vue.notify({
                            group: 'datanotif',
                            type: 'error',
                            title: 'Save Template',
                            text: 'Problem saving template. Please try again!'
                        })
                }   
            }, */
            /**
             * load template from db
             */
            /* async loadTemplate(){
                let options = await this.$refs.templatedialog.open(false, '')
                
                if (!options.cancelled) {
                    Vue.$log.info("Template loaded")
                    Vue.$log.info(options.settings)
                    let outputpath = this.workingItem.setting.outputPath
                    
                    this.workingItem.setting = Object.assign({}, options.settings)
                    this.workingItem.setting.outputPath = outputpath
                    this.saveSettings()
                    // update the current display
                    this.display_decon(this.workingItem, false)
                }
            }, */
            /****************************************************************************** */

            outputPathChanged(){
                if(this.outputBasePath===''){

                    this.workingItem.outputPath = ''
                    this.workingItem.setting.outputPath =''
                }
                else {

                    this.workingItem.outputPath = this.outputBasePath + "/" + this.outputFolderName
                    this.workingItem.setting.outputPath = this.workingItem.outputPath
                }
                console.log("this.workingItem.outputPath")
                console.log(this.workingItem.outputPath)
                this.saveSettings()
            },

            
            changeColor(color) {
                document.body.style.background = color
            },

            stepClicked() {
                console.log("at step clicked")
                
                this.workingItem.step = parseInt(this.currentStep)
                if(!this.checkStepVisibility(this.currentStep))
                    return
                if(this.visitedSteps.indexOf(this.currentStep) < 0)
                    this.visitedSteps.push(this.currentStep)
                
                this.workingItem.visitedSteps = this.visitedSteps 
                console.log("visited steps")
                console.log(this.workingItem.visitedSteps)
                console.log(this.visitedSteps)
                console.log(this.workingItem.step)
                // save from current step - review step is ignored
                // if(this.selected && this.selected[0] && this.step !== 8){
                if(this.workingItem.step !== 8){
                    let _component = this.getStepComponent(this.currentStep)
                    console.log("_component")
                    console.log(_component)
                    this.workingItem.setting = _component.get_serie()
                    console.log("this.workingItem.setting")
                    console.log(this.workingItem.setting)
                    console.log(this.workingItem)
                   /*  if(!_component.is_valid())
                        this.workingItem.setting.valid = _component.is_valid() */
                    this.saveSettings()
                
                }
                
            },

            stepChanged(number){
                var stepNumber = parseInt(number)
                this.currentStep = stepNumber
                this.workingItem.step = this.currentStep
                // this.workingItem.visitedSteps = this.workingItem.visitedSteps.filter(item => item !== stepNumber)
                // load series to new step
                if(this.workingItem.selected){
                    let _component = this.getStepComponent(stepNumber)
                    if (_component){
                        console.log("this.workingItem.setting")
                        console.log(this.workingItem.setting)
                        _component.load_serie(this.workingItem.setting)
                    }
                   this.saveSettings() 
                }
            },

            
            async nextStep(){
                this.workingItem.step = parseInt(this.currentStep)
                console.log("this.workingItem.step")
                console.log(this.workingItem.step)
                 if(this.currentStep == 2 ){
                    console.log("next step")
                    console.log(this.workingItem)
                }
                if(this.workingItem.step === 6)
                    return
                let previousStep = this.workingItem.step
                if (this.workingItem.step !== 6){
                    this.currentStep = this.currentStep + 1
                }
                this.workingItem.step = this.currentStep

               

                       
                let nextStep = this.workingItem.step
                console.log("this.workingItem.step")
                console.log(this.workingItem.step)
                this.savePreviousAndLoadNextStep(previousStep, nextStep)
                
            }, 

            previousStep(){
                this.workingItem.step = parseInt(this.currentStep)
                console.log("this.workingItem.step")
                console.log(this.workingItem.step)
                
                let previousStep = this.workingItem.step

                if (this.workingItem.step !== 1){
                    // only access to 3 if psfType = 3
                    console.log("this.workingItem.step inside")
                    console.log(this.workingItem.step)
                    this.currentStep = this.currentStep - 1
                    this.workingItem.step = this.currentStep
                    let nextStep = this.workingItem.step
                    this.savePreviousAndLoadNextStep(previousStep, nextStep)
                }
            },
            /**
             * save data from current step
             * load next step
             * to be used in next and previous buttons
             */
            savePreviousAndLoadNextStep(previousSt, nextSt){
                if(this.visitedSteps.indexOf(previousSt) < 0)
                    this.visitedSteps.push(previousSt)
                if(this.visitedSteps.indexOf(nextSt) < 0)
                    this.visitedSteps.push(nextSt)
                
                this.workingItem.visitedSteps = this.visitedSteps
                // save 
                if(previousSt !== 8){
                    let _component = this.getStepComponent(previousSt)
                    if (_component) {
                        console.log(_component)
                        this.workingItem.setting = _component.get_serie()
                        console.log("this.workingItem.setting")
                        console.log(this.workingItem)
                       // this.workingItem.setting.valid = _component.is_valid()
                        this.saveSettings()
                    }
                }
                // and load
                let _component = this.getStepComponent(nextSt)
                if (_component) {
                    console.log(_component)
                    //this.workingItem.setting.filepath = this.selected[0].series.path
                    console.log(this.workingItem.setting)
                    _component.load_serie(this.workingItem.setting)
                }
               


                  
            },

            /**
             * check certain step valid
             */
            checkStepValidity(stepId, stepComponent){
                if(stepComponent && !stepComponent.is_valid() && stepId != this.currentStep) {
                    return false
                }
                return true
            },

            checkStepVisibility(stepId) {
                return (this.visitedSteps.indexOf(stepId) >= 0)
            },

            selectedChanged(anItem) {
                anItem.item.selected = anItem.value
                if (anItem.value) {
                    if (this.singleSelect) {
                        this.selected = [anItem.item]
                        this.workingItem = { ...anItem.item }
                        this.workingItem.setting = anItem.item.setting

                        // restore output path fields from the selected record
                        this.outputBasePath = anItem.item.setting?.outputBasePath || ""
                        this.outputFolderName = anItem.item.setting?.outputFolderName || ""
                        this.workingItem.outputPath = this.outputBasePath + "/" + this.outputFolderName

                        // load the selected item's settings into the current step component
                        let _component = this.getStepComponent(this.currentStep)
                        if (_component && anItem.item.setting) {
                            _component.load_serie(anItem.item.setting)
                        }

                        // persist to DB
                        if (anItem.item.id) {
                            PreferenceAPI.update_tera(anItem.item.id, {
                                ...anItem.item.setting,
                                outputBasePath: this.outputBasePath,
                                outputFolderName: this.outputFolderName,
                                outputPath: this.workingItem.outputPath,
                                step: this.currentStep,
                                visitedSteps: this.visitedSteps
                            })
                        }
                    }
                } else {
                    // unselect: remove from selected list
                    this.selected = this.selected.filter(
                        s => s.path !== anItem.item.path
                    )

                    // if nothing left selected, reset the working state
                    if (this.selected.length === 0) {
                        this.workingItem = {}
                        this.outputBasePath = ""
                        this.outputFolderName = ""
                        this.currentStep = 1
                    }
                }
            },



            /**
             * get step component 
             */
            getStepComponent(stepId) {
                let _component = null
                switch(parseInt(stepId)) {
                    case 1:
                        _component = this.$refs.teraimport
                        break
                    case 2:
                        _component = this.$refs.teraalign
                        break
                    case 3:
                        _component = this.$refs.teraproject
                        break
                    case 4:
                        _component = this.$refs.terathreshold
                        break
                    case 5:
                        _component = this.$refs.teraplace
                        break
                    case 6:
                        _component = this.$refs.teramerge
                        break
                    case 7:
                        _component = this.$refs.teradevices
                        break
                    case 8:
                        _component = this.$refs.terareview
                        break
                }
                
                return _component
            }

        },
    }
</script>

<style lang="scss" scoped>
    .fullWidth{
        width: 100%;
    }

    .buttons-margin{
        margin-top: 50px;
        
    }
    .buttons-extra-margin{
        margin-top: 70px;
    }

    .table-area {
        /* height: 200px;
        max-width: 410px; */
        
        .scroll-x {
            overflow-x: auto;
        }
        .scroll-y {
            overflow-y: auto;
        }
    }
    .theme--dark.v-btn.v-btn--disabled.v-btn--has-bg {
        background-color: #959494!important;
    }
    .version-text {
        font-size: 12px;
        float: right;
    }
    .metdata-card {
    max-height: 400px;
    font-size: 14px;
    overflow-y: auto;
    width: 100%;

}

    

</style>