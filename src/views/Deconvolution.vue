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
        <template-dialog ref="templatedialog" />
        <v-dialog v-model="validityDialog" max-width="290">
            <v-card>
                <v-card-title class="headline">
                Invalid series/files
                </v-card-title>

                <v-card-text>
                Please fix invalid series/files settings before submission.
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" text @click="validityDialog = false">
                        Cancel
                    </v-btn>

                    <v-btn color="green darken-1" text @click="validityDialog = false">
                        OK
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <!-- psfType -->
        <v-row align="center">
            <v-col class="d-flex" cols="36" sm="12">
                <v-select
                    :items="psfTypes"
                    v-model="workingItem.setting.psfType"
                    item-text="label"
                    item-value="value"
                    label="Illumination Type"
                    @change="psfChanged"
                    outlined dense
                ></v-select>
            </v-col>
        </v-row>
        <!-- main GUI: tables, tabs -->
        <v-row>
            <!-- table and buttons-->
            <v-col class="d-flex" cols="12" sm="2" md="4" lg="4" xl="4">
                <div class="text-center">
                    <v-data-table
                        v-model="selected"
                        :headers="selectedFilesTable.headers"
                        :items="loaded"
                        :single-select="singleSelect"
                        :disable-pagination="true"
                        item-key="series.path"
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
                                    fab dark large 
                                    @click.stop="selectFiles()"
                                    v-bind="attrs" 
                                    v-on="on">
                                    <v-icon>mdi-file-multiple</v-icon>
                                </v-btn>
                            </template>
                            <span>Add single files</span>
                        </v-tooltip>


                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn 
                                    class="my-3" 
                                    color="primary" 
                                    fab dark large 
                                    v-bind="attrs" 
                                    v-on="on"
                                    @click.stop="selectFilesInFolder()">
                                    <v-icon>mdi-folder-plus</v-icon>
                                </v-btn>
                            </template>
                            <span>Add series (group of files with similar properties)</span>
                        </v-tooltip>

                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn  class="my-3" 
                                        color="warning"
                                        @click.stop="removeCurrentlySelected()" 
                                        fab dark large 
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
                                        @click.stop="removeAll()"  
                                        fab dark large 
                                        v-bind="attrs" 
                                        v-on="on">
                                    <v-icon>mdi-close-octagon</v-icon>
                                </v-btn>
                            </template>
                            <span>Remove all</span>
                        </v-tooltip>
                    </div>
                </div>
            </v-col>
            <v-divider vertical></v-divider>
            <v-col class="d-flex">
                <v-col>
                    <v-row class="d-flex" v-bind:style="{height: '85%'}" v-on:keyup.right="nextStep">
                        <v-stepper non-linear outlined
                            v-model="workingItem.step" 
                            v-bind:style="{width: '100%'}" 
                            @change="stepChanged">
                            <v-stepper-header>
                                <v-stepper-step :editable="checkStepVisibility(1)"
                                    step="1" 
                                    :complete="workingItem.step!==1 && workingItem.visitedSteps.indexOf(1) >= 0"
                                    :rules="[rules.metadatastepvalid]" 
                                    @click="stepClicked">
                                    <small>Metadata</small>
                                </v-stepper-step>
                                <v-divider></v-divider>

                                <v-stepper-step :editable="checkStepVisibility(2)" 
                                    step="2"
                                    :complete="workingItem.step!==2 && workingItem.visitedSteps.indexOf(2) >= 0"
                                    :rules="[rules.psfstepvalid]" 
                                    @click="stepClicked">
                                    <small>PSF</small>
                                </v-stepper-step>
                                <v-divider></v-divider>

                                <v-stepper-step :editable="checkStepVisibility(3)"
                                                step="3" 
                                                :complete="workingItem.step!==3 && workingItem.visitedSteps.indexOf(3) >= 0"
                                                :rules="[rules.deskewstepvalid]"  
                                                v-show="workingItem.setting.psfType===3" 
                                    @click="stepClicked">
                                    <small>Deskew</small>
                                </v-stepper-step>
                                <v-divider></v-divider>

                                <v-stepper-step :editable="checkStepVisibility(4)"
                                                :complete="workingItem.step!==4 && workingItem.visitedSteps.indexOf(4) >= 0"
                                                :rules="[rules.iterationstepvalid]"  
                                                step="4" 
                                    @click="stepClicked">
                                    <small>Iterations</small>
                                </v-stepper-step>
                                <v-divider></v-divider>

                                <v-stepper-step :editable="checkStepVisibility(5)"
                                                :complete="workingItem.step!==5 && workingItem.visitedSteps.indexOf(5) >= 0"
                                                step="5"
                                    @click="stepClicked">
                                    <small>Noise Suppression</small>
                                </v-stepper-step>
                                <v-divider></v-divider>

                                <v-stepper-step :editable="checkStepVisibility(6)"
                                                :complete="workingItem.step!==6 && workingItem.visitedSteps.indexOf(6) >= 0"
                                                :rules="[rules.advancedstepvalid]"  
                                                step="6"
                                    @click="stepClicked">
                                    <small>Advanced</small>
                                </v-stepper-step>
                                <v-divider></v-divider>

                                <v-stepper-step :editable="checkStepVisibility(7)"
                                                :complete="workingItem.step!==7 && workingItem.visitedSteps.indexOf(7) >= 0"
                                                :rules="[rules.devicesstepvalid]"  
                                                step="7"
                                    @click="stepClicked">
                                    <small>Devices</small>
                                </v-stepper-step>
                                <v-divider></v-divider>

                                <v-stepper-step :editable="checkStepVisibility(8)" 
                                                :complete="workingItem.step!==8 && workingItem.visitedSteps.indexOf(8) >= 0" 
                                                step="8"
                                    @click="stepClicked">
                                    <small>Review</small>
                                </v-stepper-step>

                            </v-stepper-header>

                            <v-stepper-items>
                                <v-stepper-content step=1>
                                    <deconvolution-metadata ref="deconmetadata"/>
                                </v-stepper-content>

                                <v-stepper-content step=2>
                                    <deconvolution-psf ref="deconpsf"/>
                                </v-stepper-content>

                                <v-stepper-content step=3>
                                    <deconvolution-deskew ref="decondeskew"/>
                                </v-stepper-content>

                                <v-stepper-content step=4>
                                    <deconvolution-iterations ref="deconiterations"/>
                                </v-stepper-content>

                                <v-stepper-content step=5>
                                    <deconvolution-noise ref="deconnoise"/>
                                </v-stepper-content>

                                <v-stepper-content step=6>
                                    <deconvolution-advanced ref="deconadvanced"/>
                                </v-stepper-content>

                                <v-stepper-content step=7>
                                    <deconvolution-devices ref="decondevices"/>
                                </v-stepper-content>

                                <v-stepper-content step=8>
                                    <deconvolution-review ref="deconreview"/>
                                </v-stepper-content>

                            </v-stepper-items>
                        </v-stepper>
                    </v-row>
                    <div class="buttons-margin"/>
                    <div class="buttons-extra-margin" v-if="workingItem && workingItem.step == 8"/>
                    <v-row class="d-flex">
                        <v-tooltip top>
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

                        
                        <v-tooltip top>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn  color="primary" rounded dark large 
                                        @click.stop="saveTemplate()" 
                                        v-bind="attrs" 
                                        :disabled="workingItem.step !== 8"
                                        v-on="on">Save Template
                                </v-btn>
                            </template>
                            <span>Save template</span>
                        </v-tooltip>
                        <v-spacer></v-spacer>
                        <v-tooltip top>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn 
                                    color="primary" rounded dark large 
                                    @click.stop="loadTemplate()"
                                    v-bind="attrs" v-on="on">Load Template
                                </v-btn>
                            </template>
                            <span>Load an existing template</span>
                        </v-tooltip>
                        <v-spacer></v-spacer>
                        <v-tooltip top>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn 
                                    color="primary" rounded dark large 
                                    v-bind="attrs" v-on="on"
                                    :disabled="selected.length === 0"
                                    @click.stop="submitSelected()">
                                        Submit Selected
                                </v-btn>
                            </template>
                            <span>Submit the selected series/files</span>
                        </v-tooltip>
                        <v-spacer></v-spacer>

                        <v-tooltip top>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn 
                                    color="primary" rounded dark large 
                                    v-bind="attrs" v-on="on"
                                    :disabled="selected.length === 0"
                                    @click.stop="submitAll()">
                                        Submit All
                                </v-btn>
                            </template>
                            <span>Submit all the series/files</span>
                        </v-tooltip>

                
                        <!-- <div class="flex-grow-1"></div> -->
                        <v-spacer></v-spacer>
                        <v-tooltip top>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn fab dark small color="primary" 
                                        @click.stop="nextStep" v-bind="attrs" v-on="on">
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

            </v-col>
        </v-row>   
    </div>    
</template>

<script>
    import Vue from 'vue'
    // import * as api from '@/api'
    import FileBrowserDialog from '@/components/FileBrowserDialog.vue'
    import DeconvolutionMetadata from '@/components/deconvolution/Metadata.vue'
    import DeconvolutionDeskew from '@/components/deconvolution/Deskew.vue'
    import DeconvolutionPsf from '@/components/deconvolution/PSF.vue'
    import DeconvolutionIterations from '@/components/deconvolution/Iterations.vue'
    import DeconvolutionNoise from '@/components/deconvolution/NoiseSupression.vue'
    import DeconvolutionAdvanced from '@/components/deconvolution/Advanced.vue'
    import DeconvolutionDevices from '@/components/deconvolution/Devices.vue'
    import DeconvolutionReview from '@/components/deconvolution/Review.vue'
    import TemplateDialog from '@/components/TemplateDialog.vue'
    // api
    import DeconvolutionAPI from "@/api/DeconvolutionAPI.js"
    import PreferenceAPI from "@/api/PreferenceAPI"
    import series from '@/utils/series.js'

    export default {
        name: 'Deconvolution',
        components: {
            FileBrowserDialog,
            DeconvolutionMetadata,
            DeconvolutionDeskew,
            DeconvolutionPsf,
            DeconvolutionIterations,
            DeconvolutionNoise,
            DeconvolutionAdvanced,
            DeconvolutionDevices,
            DeconvolutionReview,
            TemplateDialog
        },
        data() {
            return {
                validityDialog: false,
                singleSelect: true,
                loading: false,
                fileBrowserDialog: false,
                fileBrowserDialogMode: '',
                
                // -- selected files table
                selectedFilesTable: {
                    headers: [
                        { text: 'Name', value: 'series.path' }
                    ],
                },

                psfTypes: [
                    {label: 'Widefield', value: 0},
                    {label: 'Confocal', value: 1},
                    {label: 'Two Photon', value: 2},
                    {label: 'Light Sheet', value: 3},  
                ],
                nsPresets: [
                    {'label': 'Presets', 'value': -1},
                    {'label': 'Water', 'value': 1.33},
                    {'label': 'Vectashield', 'value': 1.46},
                    {'label': 'Prolong Gold', 'value': 1.44},
                    {'label': 'Fluoromount G', 'value': 1.4},
                    {'label': 'Mowiol(low RI)', 'value': 1.41},
                    {'label': 'Mowiol(low RI)', 'value': 1.49},
                    {'label': '80% Glycerol', 'value': 1.45}
                ],

                rules: {
                    // TODO: some how simplify this
                    metadatastepvalid: () => {
                        return this.checkStepValidity(1, this.$refs.deconmetadata)
                    },
                    psfstepvalid: () => {
                        return this.checkStepValidity(2, this.$refs.deconpsf)
                    },
                    deskewstepvalid: () => {
                        return this.checkStepValidity(3, this.$refs.decondeskew)
                    },
                    iterationstepvalid: () => {
                        return this.checkStepValidity(4, this.$refs.deconiterations)
                    },
                    advancedstepvalid: () => {
                        return this.checkStepValidity(6, this.$refs.deconadvanced)
                    },
                    devicesstepvalid: () => {
                        return this.checkStepValidity(7, this.$refs.decondevices)
                    }

                },
                // item to be displayed at UI
                workingItem: series.defaultDecon(),
                // selected items
                selected: [],
                // loadedItems
                loaded: [],
            }
        },
        mounted: async function() {
            let initialItems = []
            let _decons = await PreferenceAPI.get_decons(null)
            for (let _index =0; _index < _decons.length; _index++){
                let _decon = _decons[_index]
                _decon.series = await PreferenceAPI.get_serie_by_id(_decon.series_id)
                _decon.setting = await PreferenceAPI.get_setting_by_id(_decon.setting_id)
                _decon.setting = series.formatSeries(_decon.setting)
                initialItems.push(_decon)
            }
            this.loaded = this.loaded.concat(initialItems)
            // for though loaded, add to selected if needeed
            this.loaded.forEach(item => {
                if(item.selected) {
                    this.selected.push(item)            
                    this.display_decon(item)    
                }
            })
            
        },
        methods: {
            /**
             * save settings from workingItem back to selected, and save to db
             */
            saveSettings(){
                console.log("Save settings")
                this.selected.forEach(decon => {
                    decon.setting = Object.assign({}, this.workingItem.setting)
                    decon.step = this.workingItem.step
                    decon.visitedSteps = this.workingItem.visitedSteps
                    // save it
                    PreferenceAPI.update_decon(decon.id, decon)
                })
            },


            /****************************************************************************** */
            /** this part loads files/folders  **/
            // this is different from display_decon
            async load_path(pathToBeLoaded, isfolder) {
                let items = []
                try{
                    // first, check the database the decons with given path
                    let _decons = await PreferenceAPI.get_decons(pathToBeLoaded)
                    // found
                    // Vue.$log.info(_decons)
                    if ( _decons && _decons.length > 0 ) {
                        Vue.$log.debug("Found decon in database")
                        for(let _index =0; _index < _decons.length; _index++){
                            let _decon = _decons[_index]
                            let _serie = await PreferenceAPI.get_serie_by_id(_decon.series_id)
                            let _setting = await PreferenceAPI.get_setting_by_id(_decon.setting_id)
                            if (!('psfType' in _setting)){
                                _setting['psfType'] = this.workingItem.setting.psfType
                            }
                            _decon.series = _serie
                            _decon.setting = series.formatSeries(_setting)
                            items.push(_decon)
                        }
                    } else {
                        Vue.$log.debug("Not found. Do one more search from series")
                        let _storedSeries = await PreferenceAPI.get_serie(pathToBeLoaded)
                        if ( _storedSeries && _storedSeries.length > 0 ) {
                            Vue.$log.debug("Found serie in database")
                            for(let _index = 0; _index < _storedSeries.length; _index++){
                                let _storedSerie = _storedSeries[_index]
                                if (!( 'psfType' in _storedSerie)){
                                    _storedSerie['psfType'] = this.workingItem.setting.psfType
                                }
                                let _setting = series.formatSeries(_storedSerie)
                                let _decon = await PreferenceAPI.create_decon(_storedSerie.id, _setting)
                                _decon.series = _storedSerie
                                _decon.setting = _setting
                                _decon.step = 1
                                _decon.visitedSteps = []
                                _decon.selected = false
                                items.push(_decon)
                            }
                        } else {
                            Vue.$log.debug("Not found in database")
                            let response = null
                            if (isfolder)
                                response = await DeconvolutionAPI.get_folder_info(pathToBeLoaded)
                            else 
                                response = await DeconvolutionAPI.get_file_info(pathToBeLoaded)
                            
                            Vue.$log.debug("Response :")
                            Vue.$log.debug(response)
                            Vue.$log.debug(JSON.parse(JSON.stringify(response)))
                            // add to database
                            for(let _index = 0; _index < response.commandResult.length; _index++){
                                let _responseItem  = response.commandResult[_index]
                                _responseItem.isfolder = isfolder
                                let _serie = series.fixSeriesUnit(_responseItem)
                                Vue.$log.debug("Series after fixing unit :")
                                Vue.$log.debug(_serie)
                                // let _setting = series.formatSeries(_responseItem)
                                try{
                                    _serie = await PreferenceAPI.create_serie(_serie)
                                    if (!('psfType' in _serie)){
                                        _serie['psfType'] = this.workingItem.setting.psfType
                                    }
                                    let _setting = series.formatSeries(_serie)
                                    let _decon = await PreferenceAPI.create_decon(_serie.id, _setting)
                                    _decon.series = _serie
                                    _decon.setting = await PreferenceAPI.get_setting_by_id(_decon.setting_id)
                                    _decon.step = 1
                                    _decon.visitedSteps = []
                                    _decon.selected = false
                                    items.push(_decon)
                                }
                                catch(err) {
                                    Vue.$log.error(err)
                                }// end catch                                    
                            } // end for
                        } // end not found in db
                    }
                    Vue.$log.debug("items :")
                    Vue.$log.debug(items)
                }
                catch(err){
                    Vue.$log.error(err)
                    Vue.notify({
                        group: 'sysnotif',
                        type: 'error',
                        title: 'SelectFiles',
                        text: 'Problem selecting files, try again!' + String(err)
                    })
                }
                return items
            },
            /**
             * a common function; to be called by selectFiles, selectFilesInFolders
             */
            async selectFilesOrFolders(isfolder){
                let options = null
                if (isfolder)
                    options = await this.$refs.filedialog.open('selectfilesinfolder', 'Deconvolution', '/')
                else 
                    options = await this.$refs.filedialog.open('selectfiles', 'Deconvolution', '/')
                if (!options.cancelled) {
                    let paths = []
                    if(isfolder){
                        let _pathToBeLoaded = options.path + options.filter
                        Vue.$log.debug("selecting series:" + _pathToBeLoaded)
                        let _exist = false
                        this.loaded.map(file => {
                            if (file.series.path === _pathToBeLoaded)
                                _exist = true
                        })
                        if (_exist)
                            return
                        paths.push(_pathToBeLoaded)
                    } else {
                        Vue.$log.debug("selecting files:")
                        Vue.$log.debug(options.selectedItems)
                        for(let i = 0; i< options.selectedItems.length; i++){
                            let _exists = false
                            this.loaded.map(file => {
                                if (file.series.path === options.selectedItems[i].path)
                                    _exists = true
                            })
                            if (!_exists)
                                paths.push(options.selectedItems[i].path)
                        }
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
                        
                    this.loading = true
                    // now load the paths
                    for(let i =0; i < paths.length; i++){
                        Vue.$log.debug(">>>loading:" + paths[i])
                        let items = await this.load_path(paths[i], isfolder)
                        Vue.$log.debug("Results:")
                        Vue.$log.debug(items)
                        this.loaded = this.loaded.concat(items)
                    }
                    if ((!this.selected || this.selected.length ==0) && this.loaded.length > 0){
                        this.selected = [ this.loaded[0] ]
                        this.display_decon(this.loaded[0])
                    }
                    this.loading = false                    
                }
            },


            /**
             * called when select single files
             */
            async selectFiles(){
                await this.selectFilesOrFolders(false)
            },
            /**
             * select series
             */
            async selectFilesInFolder(){
                await this.selectFilesOrFolders(true)
            },

        
            /**
             * remove currently selected serie
             */
            removeCurrentlySelected(){
                Vue.$log.info("Removing currently seleced item")
                this.selected.forEach(item => {
                    for(let i = 0; i < this.loaded.length; i++){
                        if(this.loaded[i].series.path === item.series.path){
                            let _deconid = this.loaded[i].id
                            this.loaded.splice(i, 1)
                            PreferenceAPI.delete_decon(_deconid)
                        }
                    }
                })
                this.selected = []
                // load an empty one
                this.workingItem = series.defaultDecon()
                this.display_decon(this.workingItem, false)
            },
            /**
             * delete all series
             */
            removeAll(){
                // delete all decons
                for(let i = 0; i < this.loaded.length; i++){
                    PreferenceAPI.delete_decon(this.loaded[i].id)
                    
                }
                this.loaded = []
                this.selected = []
                this.workingItem = series.defaultDecon()
                this.display_decon(this.workingItem, false)
            },
            /* end part dealing with load */
            /****************************************************************************** */



            /****************************************************************************** */
            /** submit job */
            async submitSingleJob(item){
                let _numberOfJobs = parseInt(item.setting.instances)
                let _jobs = await PreferenceAPI.create_decon_jobs(item.id, _numberOfJobs)
                let _jobIds = _jobs.map(_job => {
                    return _job.id
                })
                try{
                    await DeconvolutionAPI.execute_microvolution(item.setting.outputPath, _numberOfJobs, 
                                    item.setting.mem, item.setting.gpus, item, _jobIds, false)
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
                    
                }
            },
            /**
             * submit all the series
             * when this is called, it means all series are valid
             */
            async submitAll(){
                for (let i=0; i< this.loaded.length; i++) {
                    console.log(this.loaded[i].setting)
                    if (!this.loaded[i].setting.valid) {
                        this.validityDialog = true
                        return
                    }
                }
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
                for (let i=0; i< this.selected.length; i++) {
                    console.log(this.loaded[i].setting)
                    if (!this.selected[i].setting.valid) {
                        this.validityDialog = true
                        return
                    }
                }
                for (let i = 0; i < this.selected.length; i++) {
                    await this.submitSingleJob(this.selected[i])
                }
            },

            /****************************************************************************** */



            /****************************************************************************** */
            /**
             * save template to databsae: save the working one
             */
            async saveTemplate(){
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
            },
            /**
             * load template from db
             */
            async loadTemplate(){
                let options = await this.$refs.templatedialog.open(false, '')
                if (!options.cancelled) {
                    Vue.$log.info("Template loaded")
                    Vue.$log.info(options.settings)
                    this.workingItem.setting = Object.assign({}, options.settings)
                    this.saveSettings()
                    // update the current display
                    this.display_decon(this.workingItem, false)
                }
            },
            /****************************************************************************** */


            /**
             * load decon
             */
            display_decon(decon, duplicate=true){
                // update tab
                if(duplicate)
                    this.workingItem = Object.assign({}, decon)
                else
                    this.workingItem = decon
                let _anyInvalidStep = false
                if (this.workingItem.visitedSteps.length === 0 )
                    this.workingItem.visitedSteps = [ 1 ]
                this.workingItem.visitedSteps.forEach(it => {
                    // Vue.$log.info("Loading ....")
                    // Vue.$log.info(decon.setting)
                    if(this.workingItem.setting.psfType !== 3 && it ===3)
                        return
                    let _acomponent = this.getStepComponent(it)
                    if(_acomponent){
                        _acomponent.load_serie(decon.setting)
                        if(!_acomponent.is_valid())
                            _anyInvalidStep = true
                    }
                })
                if(this.workingItem.setting.psfType !== 3){
                    if(this.workingItem.visitedSteps.length < 7)
                        this.workingItem.setting.valid = false
                    else
                        this.workingItem.setting.valid = !_anyInvalidStep
                } else {
                    if(this.workingItem.visitedSteps.length < 8)
                        this.workingItem.setting.valid = false
                    else
                        this.workingItem.setting.valid = !_anyInvalidStep
                }
                 
            },

            //anItem looks like this { item: any, value: boolean }
            /**
             * an item is selected
             * copy this item settings to the working one ?
             */
            selectedChanged(anItem){
                // if selected, load it
                anItem.item.selected = anItem.value
                if (anItem.value){
                    // console.log("selecting ...." + anItem.item.series.path)
                    if ( this.singleSelect ) {
                        this.selected = [ anItem.item ]
                        this.display_decon(anItem.item)
                        //save
                    }
                    else {
                        // not sure what to do here:
                        // load anItem to workingItem is nothing loaded
                        // otherwise do nothing --> meaning any change will write back to anItem
                        Vue.$log.info("TODO here")
                    }
                    PreferenceAPI.update_decon(anItem.item.id, anItem.item)    
                } else {
                    Vue.$log.info("Unselect item")
                    //save
                    // remove this from selected
                    for(let i = 0; i < this.selected.length; i++){
                        if(this.selected[i].series.path === anItem.item.series.path){
                            this.selected.splice(i, 1)
                        }
                    }
                    if(this.selected.length == 0) {
                        this.display_decon(series.defaultDecon(), false)
                    }
                }
            }, 

            /**
             * when psfChanged
             */
            psfChanged(){
                // console.log('psftype=' + this.workingItem.setting.psfType)
                if (this.workingItem.setting.psfType !== 3 ) {
                    this.workingItem.setting.deskew = false
                    this.workingItem.setting.keepDeskew = false
                }
                this.saveSettings()
                // is this needed
                this.display_decon(this.workingItem, false)
            },

            stepClicked() {
                this.workingItem.step = parseInt(this.workingItem.step)
                console.log("@stepClicked:" + this.workingItem.step)
                if(!this.checkStepVisibility(this.workingItem.step))
                    return
                if(this.workingItem.visitedSteps.indexOf(this.workingItem.step) < 0)
                    this.workingItem.visitedSteps.push(this.workingItem.step)
                // save from current step - review step is ignored
                // if(this.selected && this.selected[0] && this.step !== 8){
                if(this.workingItem.step !== 8){
                    let _component = this.getStepComponent(this.workingItem.step)
                    this.workingItem.setting = _component.get_serie()
                    if(!_component.is_valid())
                        this.workingItem.setting.valid = _component.is_valid()
                    this.saveSettings()
                
                }
            },

            stepChanged(number){
                var stepNumber = parseInt(number)
                this.workingItem.step = stepNumber
                // this.workingItem.visitedSteps = this.workingItem.visitedSteps.filter(item => item !== stepNumber)
                // console.log(this.workingItem.visitedSteps)
                // load series to new step
                if(this.workingItem.selected){
                    let _component = this.getStepComponent(stepNumber)
                    if (_component)
                        _component.load_serie(this.workingItem.setting)
                    PreferenceAPI.update_decon(this.workingItem.id, this.workingItem)   
                }
            },

            nextStep(){
                this.workingItem.step = parseInt(this.workingItem.step)
                if(this.workingItem.step === 8)
                    return
                //even if current step is invalid, next will allow it to go if it has been visited
                if(!this.getStepComponent(this.workingItem.step).is_valid())
                    return
                let previousStep = this.workingItem.step
                // add to visited
                if (this.workingItem.step !== 8){
                    // only access to 3 if psfType = 3
                    if(this.workingItem.setting.psfType === 3 || this.workingItem.step !== 2)
                        this.workingItem.step = this.workingItem.step + 1
                    else
                        this.workingItem.step = 4
                    let nextStep = this.workingItem.step
                    this.savePreviousAndLoadNextStep(previousStep, nextStep)
                }
            }, 

            previousStep(){
                this.workingItem.step = parseInt(this.workingItem.step)
                if(!this.getStepComponent(this.workingItem.step).is_valid())
                    return
                let previousStep = this.workingItem.step

                if (this.workingItem.step !== 1){
                    // only access to 3 if psfType = 3
                    if(this.workingItem.setting.psfType === 3 || this.workingItem.step !== 4)
                        this.workingItem.step = this.workingItem.step - 1
                    else
                        this.workingItem.step = 2
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
                if(this.workingItem.visitedSteps.indexOf(previousSt) < 0)
                    this.workingItem.visitedSteps.push(previousSt)
                if(this.workingItem.visitedSteps.indexOf(nextSt) < 0)
                    this.workingItem.visitedSteps.push(nextSt)
                

                // save 
                if(previousSt !== 8){
                    let _component = this.getStepComponent(previousSt)
                    if (_component) {
                        this.workingItem.setting = _component.get_serie()
                        this.workingItem.setting.valid = _component.is_valid()
                        this.saveSettings()
                    }
                }
                // and load
                let _component = this.getStepComponent(nextSt)
                if (_component)
                    _component.load_serie(this.workingItem.setting)
            },

            /**
             * check certain step valid
             */
            checkStepValidity(stepId, stepComponent){
                if(stepComponent && !stepComponent.is_valid() && stepId != this.workingItem.step) {
                    return false
                }
                return true
            },

            checkStepVisibility(stepId) {
                return (this.workingItem.visitedSteps.indexOf(stepId) >= 0)
            },

            /**
             * get step component 
             */
            getStepComponent(stepId) {
                let _component = null
                switch(parseInt(stepId)) {
                    case 1:
                        _component = this.$refs.deconmetadata
                        break
                    case 2:
                        _component = this.$refs.deconpsf
                        break
                    case 3:
                        _component = this.$refs.decondeskew
                        break
                    case 4:
                        _component = this.$refs.deconiterations
                        break
                    case 5:
                        _component = this.$refs.deconnoise
                        break
                    case 6:
                        _component = this.$refs.deconadvanced
                        break
                    case 7:
                        _component = this.$refs.decondevices
                        break
                    case 8:
                        _component = this.$refs.deconreview
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
        margin-top: 20px;
    }
    .buttons-extra-margin{
        margin-top: 50px;
    }
</style>