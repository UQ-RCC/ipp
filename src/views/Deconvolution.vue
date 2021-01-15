<template>
    <v-card  :loading="loading > 0">
        <file-browser-dialog ref="filedialog" />
        <template-dialog ref="templatedialog" />
        <!-- psfType -->
        <v-row align="center">
            <v-col
                class="d-flex"
                cols="36"
                sm="12"
            >
                <v-select
                :items="psfTypes"
                v-model="form.psfType"
                item-text="label"
                item-value="value"
                label="Illumination Type"
                @change="psfChanged"
                outlined
                ></v-select>
            </v-col>
        </v-row>
        <!-- main GUI: tables, tabs -->
        <v-row >
            <!-- table and buttons-->
            <v-col
                class="d-flex"
                cols="12"
                sm="4"
            >
                <div class="text-center">
                    <v-data-table
                        v-model="selected"
                        :headers="selectedFilesTable.headers"
                        :items="selectedFiles"
                        :single-select="true"
                        :disable-pagination="true"
                        item-key="name"
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
                                    v-bind="attrs" 
                                    v-on="on"
                                    @click.stop="selectFilesInFolder()">
                                    <v-icon>mdi-folder-plus</v-icon>
                                </v-btn>
                            </template>
                            <span>Add series (folders)</span>
                        </v-tooltip>

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
                            <span>Add individual files</span>
                        </v-tooltip>

                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn  class="my-3" 
                                        color="warning"
                                        @click.stop="removeCurrentSerie()" 
                                        fab dark large 
                                        v-bind="attrs" 
                                        v-on="on">
                                    <v-icon>mdi-minus-circle-outline</v-icon>
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
                                    <v-icon>mdi-restart</v-icon>
                                </v-btn>
                            </template>
                            <span>Clear all</span>
                        </v-tooltip>
                    </div>

                    <v-text-field
                        label="Output Base Path"
                        hide-details="auto"
                        class="my-2"
                        v-model="form.outputBasePath"
                    ></v-text-field>

                    <v-text-field
                        label="Output Folder"
                        hide-details="auto"
                        class="my-2"
                        v-model="form.outputFolderName"
                    ></v-text-field>

                    <div>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn 
                                    class="my-3" 
                                    color="primary" 
                                    @click.stop="chooseOutputFolder"
                                    rounded dark large 
                                    v-bind="attrs" v-on="on"
                                    >
                                    Choose Output Folder
                                </v-btn>
                            </template>
                            <span>Select where to save the outputs</span>
                        </v-tooltip>
                    </div>

                    <!-- <v-checkbox
                        v-model="form.seperateOutputsBasedonInput"
                        label="Separate outputs based on input paths"
                    ></v-checkbox> -->

                </div>
            </v-col>
            <v-divider vertical></v-divider>
            <v-col class="d-flex">
                <v-col>
                    <v-row class="d-flex" v-bind:style="{height: '93%'}">
                        <v-stepper alt-labels non-linear v-model="step" v-bind:style="{width: '100%'}" @change="stepChanged">
                            <v-stepper-header>
                                <v-stepper-step editable step="1" 
                                    :complete="step!==1 && visitedSteps.indexOf(1) >= 0"
                                    :rules="[rules.metadatastepvalid]" 
                                    @click="stepClicked">
                                    <small>Metadata</small>
                                </v-stepper-step>
                                <v-divider></v-divider>

                                <v-stepper-step editable step="2"
                                    :complete="step!==2 && visitedSteps.indexOf(2) >= 0"
                                    :rules="[rules.psfstepvalid]" 
                                    @click="stepClicked">
                                    <small>PSF</small>
                                </v-stepper-step>
                                <v-divider></v-divider>

                                <v-stepper-step editable step="3" 
                                                :complete="step!==3 && visitedSteps.indexOf(3) >= 0"
                                                :rules="[rules.deskewstepvalid]"  
                                                v-show="form.psfType===3" 
                                    @click="stepClicked">
                                    <small>Deskew</small>
                                </v-stepper-step>
                                <v-divider></v-divider>

                                <v-stepper-step editable 
                                                :complete="step!==4 && visitedSteps.indexOf(4) >= 0"
                                                :rules="[rules.iterationstepvalid]"  
                                                step="4" 
                                    @click="stepClicked">
                                    <small>Iterations</small>
                                </v-stepper-step>
                                <v-divider></v-divider>

                                <v-stepper-step editable 
                                                :complete="step!==5 && visitedSteps.indexOf(5) >= 0"
                                                step="5"
                                    @click="stepClicked">
                                    <small>Noise Suppression</small>
                                </v-stepper-step>
                                <v-divider></v-divider>

                                <v-stepper-step editable 
                                                :complete="step!==6 && visitedSteps.indexOf(6) >= 0"
                                                :rules="[rules.advancedstepvalid]"  
                                                step="6"
                                    @click="stepClicked">
                                    <small>Advanced</small>
                                </v-stepper-step>
                                <v-divider></v-divider>

                                <v-stepper-step editable 
                                                :complete="step!==7 && visitedSteps.indexOf(7) >= 0"
                                                :rules="[rules.devicesstepvalid]"  
                                                step="7"
                                    @click="stepClicked">
                                    <small>Devices</small>
                                </v-stepper-step>
                                <v-divider></v-divider>

                                <v-stepper-step editable 
                                                :complete="step!==8 && visitedSteps.indexOf(8) >= 0" 
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
                                    <deconvolution-review ref="deconreview"
                                        v-on:template-save = saveTemplate
                                    />
                                </v-stepper-content>

                            </v-stepper-items>
                        </v-stepper>
                    </v-row>
                    <p />
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
                        
                        <div class="flex-grow-1"></div>
            
                        <v-tooltip top>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn 
                                    color="primary" 
                                    rounded dark large 
                                    @click.stop="loadTemplate()"
                                    v-bind="attrs" 
                                    v-on="on">Load Template
                                </v-btn>
                            </template>
                            <span>Load an existing template</span>
                        </v-tooltip>

                        <v-tooltip top>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn 
                                    color="primary" rounded dark large 
                                    v-bind="attrs" 
                                    v-on="on"
                                    :disabled="step != 8"
                                    @click.stop="submit()">
                                        Submit
                                </v-btn>
                            </template>
                            <span>Submit the job</span>
                        </v-tooltip>
                
                        <div class="flex-grow-1"></div>
                        <v-tooltip top>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn fab dark small color="primary" 
                                        @click.stop="nextStep" v-bind="attrs" v-on="on">
                                    <v-icon dark>
                                        mdi-chevron-right
                                    </v-icon>
                                </v-btn>
                            </template>
                            <span>Next step</span>
                        </v-tooltip>
                    </v-row>
                </v-col>


            </v-col>
        </v-row>
        
    </v-card>    
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
    // let series = require('@/utils/series')

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
                // ---- form specific
                step: 1,
                visitedSteps: [],
                loading: false,
                form: {
                    outputBasePath: '',
                    outputFolderName: '',
                    // seperateOutputsBasedonInput: false,
                    psfType: 3,
                },
                fileBrowserDialog: false,
                fileBrowserDialogMode: '',
                
                // -- selected files table
                selectedFilesTable: {
                    headers: [
                        { text: 'Name', value: 'name' }
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
                // things to be saved - really
                selected: [],
                selectedFiles: [],
            }
        },
        mounted: async function() {
            let _decons = await PreferenceAPI.get_decons(null)
            let initialItems = _decons.map(async _decon => {
                let _serie = await PreferenceAPI.get_serie_by_id(_decon.series_id)
                let _setting = await PreferenceAPI.get_setting_by_id(_decon.setting_id)
                let _item = Object.assign({}, _setting, _serie)
                // make sure the id of item belongs to settings
                _item['id'] = _setting['id']
                return series.formatSeries(_item)
            })
            this.selectedFiles = this.selectedFiles.concat(await Promise.all(initialItems))
            console.log("selected files --->")
            console.log(this.selectedFiles)
            if ((!this.selected || this.selected.length ==0) && this.selectedFiles.length > 0){
                this.selected = [ this.selectedFiles[0] ]
                this.load_series(this.selectedFiles[0])
            }
        },
        methods: {
            async chooseOutputFolder(){
                let options = await this.$refs.filedialog.open('selectfolder', 'Deconvolution', '/');
                if (!options.cancelled && options.path) {
                    var selectedFolder = options.path;
                    if(selectedFolder.endsWith('/'))
                        selectedFolder = selectedFolder.slice(0, -1);
                    var _pathParts = selectedFolder.split("/");
                    this.form.outputBasePath = _pathParts.slice(0,-1).join("/")
                    this.form.outputFolderName = _pathParts.slice(-1)[0]
                    if(this.selection && this.selected[0]){
                        this.selected[0].outputPath = (this.form.outputBasePath==='')?'': this.form.outputBasePath + "/" + this.form.outputFolderName
                    }
                }
            },
            async selectFiles(){
                let options = await this.$refs.filedialog.open('selectfiles', 'Deconvolution', '/');
                if (!options.cancelled) {
                    Vue.$log.info("...........")
                    Vue.$log.info(options.path);
                    // selectedItem.path points to file
                    Vue.$log.info(options.selectedItems)
                }
            },
            async selectFilesInFolder(){
                let options = await this.$refs.filedialog.open('selectfilesinfolder', 'Deconvolution', '/');
                if (!options.cancelled) {
                    let _pathToBeLoaded = options.path + options.filter
                    Vue.$log.info("selecting files:" + _pathToBeLoaded)
                    let _exist = false
                    this.selectedFiles.map(file => {
                        if (file.path === _pathToBeLoaded)
                            _exist = true
                    })
                    if (_exist)
                        return
                    this.loading = true;
                    try{
                        this.loading = true;
                        // first, check the database the decons with given path
                        let _decons = await PreferenceAPI.get_decons(_pathToBeLoaded)
                        let items = []
                        // found
                        Vue.$log.info(_decons)
                        if ( _decons && _decons.length > 0 ) {
                            Vue.$log.info("Found decon in database")
                            let _storedSeries = _decons.map(async _decon => {
                                let _serie = await PreferenceAPI.get_serie_by_id(_decon.series_id)
                                let _setting = await PreferenceAPI.get_setting_by_id(_decon.setting_id)
                                let _item = Object.assign({}, _setting, _serie)
                                // make sure the id of item belongs to settings
                                _item['id'] = _setting['id']
                                return series.formatSeries(_item)
                            })
                            items = await Promise.all(_storedSeries)
                        } else {
                            Vue.$log.info("Not found. Do one more search from series")
                            let _storedSeries = await PreferenceAPI.get_serie(_pathToBeLoaded)
                            if ( _storedSeries && _storedSeries.length > 0 ) {
                                Vue.$log.info("Found serie in database")
                                items = _storedSeries.map(storedSerie => {
                                    let _serie = series.formatSeries(storedSerie)
                                    PreferenceAPI.create_decon(storedSerie.id, _serie)
                                    return _serie
                                })
                            } else {
                                Vue.$log.info("Not found in database")
                                let response = await DeconvolutionAPI.get_folder_info(_pathToBeLoaded)
                                Vue.$log.info("Response :")
                                Vue.$log.info(JSON.parse(JSON.stringify(response)))
                                // add to database
                                items = response.commandResult.map(responseItem => {
                                    let _seriesetting = series.formatSeries(responseItem)
                                    PreferenceAPI.create_serie(series.fixSeriesUnit(responseItem)).then(function(db_serie){
                                        PreferenceAPI.create_decon(db_serie.id, _seriesetting)
                                    })
                                    return _seriesetting
                                })
                            }
                        }

                        // let maxFileSizeMbs = this.items[0].maxSizeM;
                        // suggest mem
                        this.selectedFiles = this.selectedFiles.concat(items)
                        if ((!this.selected || this.selected.length ==0) && this.selectedFiles.length > 0){
                            this.selected = [ this.selectedFiles[0] ]
                            this.load_series(this.selectedFiles[0])
                        }
                    }
                    catch(err){
                        Vue.$log.info(err);
                        Vue.notify({
                            group: 'sysnotif',
                            type: 'error',
                            title: 'SelectFiles',
                            text: 'Problem selecting files, try again!' + String(err)
                        });
                    }
                    this.loading = false;
                }
            },
            // remove currently selected serie
            removeCurrentSerie(){
                if(this.selected && this.selected[0]){
                    for(var i=0; i <=this.selectedFiles.length; i++){
                        if (this.selectedFiles[i]['path'] === this.selected[0]['path']){
                            this.selectedFiles.splice(i, 1)
                            // remove this series in the database
                            PreferenceAPI.delete_decon_using_path(this.selected[0]['path'])
                            // load new one
                            if (this.selectedFiles.length > 0){
                                this.selected = [ this.selectedFiles[0] ]
                                this.load_series(this.selectedFiles[0])
                            } else {
                                this.selected = []
                            }
                        }// end if
                    }// end for
                }
            },
            // remove all series
            removeAll(){
                this.selectedFiles = []
                this.selected = []
                this.load_series(series.formatSeries(null))
            },
            submit(){
                console.log("submit...")
                // if any component is invalid, show a dialog to fix those
            },
            async saveTemplate(){
                if(this.selected && this.selected[0]){
                    let options = await this.$refs.templatedialog.open(true, this.selected[0])
                    if (!options.cancelled) {
                        if(options.success)
                            Vue.notify({
                                group: 'sysnotif',
                                type: 'info',
                                title: 'Save Template',
                                text: 'Successfully save template'
                            })
                        else 
                            Vue.notify({
                                group: 'sysnotif',
                                type: 'error',
                                title: 'Save Template',
                                text: 'Problem saving template. Please try again!'
                            })
                    }   
                }
            },
            async loadTemplate(){
                let options = await this.$refs.templatedialog.open(false, '')
                if (!options.cancelled) {
                    // TODO: load this
                    Vue.$log.info("...........")
                    Vue.$log.info(options.settings)
                }
            },
            
            // load series
            load_series(series){
                // update tab
                let currentComponent = this.getStepComponent(this.step)
                if(currentComponent){
                    currentComponent.load_serie(series)
                }    
                // update form
                if(series['outputPath']) {
                    var _pathParts = series['outputPath'].split("/")
                    this.form.outputBasePath = _pathParts.slice(0,-1).join("/")
                    this.form.outputFolderName = _pathParts.slice(-1)[0]
                } else {
                    this.form.outputBasePath = ""
                    this.form.outputFolderName = ""
                }
                // this.form.seperateOutputsBasedonInput = series['seperateOutputsBasedonInput']
                this.form.psfType = series['psfType']
            },

            //anItem looks like this { item: any, value: boolean }
            async selectedChanged(anItem){
                // selected
                //TODO: save pref on this.selected
                if(this.selected && this.selected[0]){
                    this.selected[0].outputPath = (this.form.outputBasePath==='')?'': this.form.outputBasePath + "/" + this.form.outputFolderName
                    // this.selected[0]['seperateOutputsBasedonInput'] = this.form.seperateOutputsBasedonInput
                    // TODO: save here ?
                }
                // if selected, load it
                if (anItem.value){
                    // console.log(anItem)
                    this.load_series(anItem.item)
                }
            }, 

            // psf type changed
            psfChanged(){
                console.log("psf type changed")
                console.log(this.form.psfType)
                if(this.selected && this.selected[0]){
                    this.selected[0]['psfType'] = this.form.psfType
                    // save
                    PreferenceAPI.update_setting(this.selected[0].id, this.selected[0])
                    //reload
                    this.load_series(this.selected[0])
                }
            },

            stepClicked() {
                this.step = parseInt(this.step)
                if(this.visitedSteps.indexOf(this.step) < 0)
                    this.visitedSteps.push(this.step)
                // save from current step - review step is ignored
                // if(this.selected && this.selected[0] && this.step !== 8){
                if(this.selected && this.step !== 8){
                    let _component = this.getStepComponent(this.step)
                    if (_component) {
                        this.selected[0] = _component.get_serie()
                        // console.log("saving this ........")
                        // console.log(this.selected[0])
                        PreferenceAPI.update_setting(this.selected[0].id, this.selected[0])
                    }
                }
            },

            stepChanged(number){
                var stepNumber = parseInt(number)
                this.visitedSteps = this.visitedSteps.filter(item => item !== stepNumber)
                // load series to new step
                if(this.selected && this.selected[0]){
                    let _component = this.getStepComponent(stepNumber)
                    if (_component)
                        _component.load_serie(this.selected[0])
                }
            },

            nextStep(){
                this.step = parseInt(this.step)
                let previousStep = this.step
                // add to visited
                if(this.visitedSteps.indexOf(this.step) < 0)
                    this.visitedSteps.push(this.step)

                if (this.step !== 8){
                    // only access to 3 if psfType = 3
                    if(this.form.psfType === 3 || this.step !== 2)
                        this.step = this.step + 1
                    else
                        this.step = 4
                    let nextStep = this.step
                    this.savePreviousAndLoadNextStep(previousStep, nextStep)
 
                }
            }, 

            previousStep(){
                this.step = parseInt(this.step)
                let previousStep = this.step
                // add to visited
                if(this.visitedSteps.indexOf(this.step) < 0)
                    this.visitedSteps.push(this.step)

                if (this.step !== 1){
                    // only access to 3 if psfType = 3
                    if(this.form.psfType === 3 || this.step !== 4)
                        this.step = this.step - 1
                    else
                        this.step = 2
                    let nextStep = this.step
                    this.savePreviousAndLoadNextStep(previousStep, nextStep)
                }
            },
            /**
             * save data from current step
             * load next step
             * to be used in next and previous buttons
             */
            savePreviousAndLoadNextStep(previousSt, nextSt){
                // save 
                if(this.selected && previousSt !== 8){
                    let _component = this.getStepComponent(previousSt)
                    if (_component)
                        this.selected[0] = _component.get_serie()
                }
                // and load
                if(this.selected && this.selected[0]){
                    let _component = this.getStepComponent(nextSt)
                    if (_component)
                        _component.load_serie(this.selected[0])
                }
            },

            /**
             * check certain step valid
             */
            checkStepValidity(stepId, stepComponent){
                if (this.step === stepId || this.visitedSteps.indexOf(stepId) < 0 ||
                    (stepComponent && stepComponent.is_valid()) )
                    return true
                else
                    return false
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
</style>