<template>
    <div>
        <v-progress-linear
            color="primary accent-4"
            indeterminate
            rounded
            height="4"
            :active="loading"
        ></v-progress-linear>
        <v-overlay v-model="overlay">
            <v-row align="center" justify="center"><label >Validating devices, Please wait..</label> </v-row>
            <v-row align="center" justify="center"><v-progress-circular
                color="primary"
                indeterminate
                size="64"
            ></v-progress-circular></v-row>
            
        </v-overlay>
        <br />
        <file-browser-dialog ref="filedialog" />
        <template-dialog ref="templatedialog" />
        <MetadataDialog ref="metadatadialog" />
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
                        item-key="tempID"
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
                                    style="margin: 5px;"
                                    fab dark default 
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
                        <v-col >
                            <h4 v-if="mloading">Loading metadata</h4>
                            <h4 v-if="!mloading">Metadata</h4>
                            <h5 v-if="csvloading">Exporting to a CSV file</h5> 
                            <h5 v-if="csvlocation &&  !csvloading && !mloading ">File saved in {{ csvlocation }}</h5> 
                            <v-progress-linear
                                color="primary"
                                indeterminate
                                rounded
                                height="5"
                                :active="mloading"
                        ></v-progress-linear>
                            <v-progress-linear
                                color="primary"
                                indeterminate
                                rounded
                                height="3"
                                :active="csvloading"
                        ></v-progress-linear>
                        
                        </v-col>
                        <v-col>
                        <v-card class="metdata-card" >
                            <div>
                                    <v-expansion-panels accordion>
                                        <v-expansion-panel v-for="item in metedataResults" :key="item.file">
                                                <v-expansion-panel-header  >
                                                    <v-row align="center" justify="center">

                                                        <v-col class="d-flex"  cols="1"  >
                                                            <v-tooltip bottom>
                                                                <template v-slot:activator="{ on, attrs }">
                                                                    <v-btn  
                                                                        class="my-3" 
                                                                        style="min-width:1px !important;width:2px"
                                                                        color="primary"
                                                                        @click.stop="downloadToCSV(item)"   
                                                                        v-bind="attrs" 
                                                                        v-on="on">
                                                                        <v-icon>mdi-download</v-icon>
                                                                    </v-btn>
                                                                </template>
                                                                <span>Download CSV</span>
                                                            </v-tooltip>
                                                        </v-col>
                                                        <v-col   cols="11" >{{ item.file }}</v-col> 
                                                    </v-row>
                                                </v-expansion-panel-header>
                                                <v-expansion-panel-content >

                                                    <v-row >
                                                        <v-col >
                                                            
                                                                <!-- <v-card-text> -->
                                                                    <v-table fixed-header >
                                                                        <thead>
                                                                            <tr>
                                                                                <th class="text-left">
                                                                                    Parameter</th>
                                                                                <th class="text-left">Value 
                                                                                    
                                                                                </th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            <tr v-for="(value, key) in item"
                                                                                v-bind:key="key">
                                                                                <td class="text-left">{{ key }} </td>
                                                                                <td class="text-left">{{ value }}</td>
                                                
                                                                            </tr>
                                                                        </tbody>
                                                
                                                                    </v-table>
                                                                <!-- </v-card-text> -->    
                                                            
                                                        </v-col>
                                                    </v-row>

                                                </v-expansion-panel-content>
                                            </v-expansion-panel>

                                    </v-expansion-panels>
                                

                            </div>
                        </v-card></v-col>
                    </div>
                </div>

            </v-col>
            <v-divider vertical></v-divider>
            <v-col cols="12" sm="12" md="8" lg="8" xl="8" style="height:850px">
                
                    <v-row>
                        <v-col>
                            <p class="version-text" v-if="api=='Microvolution'">Microvolution Version 2022.10</p>
                            <p class="version-text" v-if="api=='CudaDecon'">CudaDecon</p>

                        </v-col>
                    </v-row>
                    <!-- psfType -->
                    <!-- <v-row align="center">
                       
                    </v-row> -->

                    <v-row >
                        <v-col class="d-flex" >
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
                        </v-col>
                        
                        <v-spacer></v-spacer>
                        <v-col class="d-flex" cols="10" sm="8" >
                            <v-select
                                :items="psfTypes"
                                v-model="workingItem.setting.psfType"
                                item-text="label"
                                item-value="value"
                                label="Illumination Type"
                                @change="psfChanged"
                                outlined dense
                                v-show="api=='Microvolution'"
                            ></v-select>
                        </v-col>
                        <v-spacer></v-spacer> 
                        <v-col class="d-flex" >

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
                        </v-col>

                    </v-row>
                    
                    <v-row class="d-flex" v-bind:style="{height: '70%',margin:'10px'}" v-on:keyup.right="nextStep">
                        <v-stepper non-linear outlined v-model="workingItem.step"  v-bind:style="{width: '100%'}"  @change="stepChanged" >
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
                                    @click="stepClicked">
                                    <small>PSF</small>
                                </v-stepper-step>
                                <v-divider></v-divider>
                                <v-stepper-step :editable="checkStepVisibility(3)"
                                                step="3" 
                                                :complete="workingItem.step!==3 && workingItem.visitedSteps.indexOf(3) >= 0"
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
                                                v-show="api==='Microvolution'" 
                                                step="5"
                                    @click="stepClicked">
                                    <small>Noise Suppression</small>
                                </v-stepper-step>
                                <v-divider></v-divider>
                                <v-stepper-step :editable="checkStepVisibility(6)"
                                                :complete="workingItem.step!==6 && workingItem.visitedSteps.indexOf(6) >= 0"
                                                :rules="[rules.advancedstepvalid]"  
                                                v-show="api==='Microvolution'"
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

                                <v-stepper-content step=5 >
                                    <deconvolution-noise ref="deconnoise" />
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
                    <v-row class="d-flex" v-bind:style="{margin:'10px'}" >
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
                                <v-btn  color="primary" rounded dark default 
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
                                    color="primary" rounded dark default 
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
                                    color="primary" rounded dark default 
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
                                    color="primary" rounded dark default 
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
    import MetadataDialog from '@/components/MetadataDialog.vue'
    
    // api
    import DeconvolutionAPI from "@/api/DeconvolutionAPI.js"
    import ConfigurationAPI from "@/api/ConfigurationAPI.js"
    import PreferenceAPI from "@/api/PreferenceAPI"
    import series from '@/utils/series.js'
    import miscs from '@/utils/miscs.js'
    import FilesAPI from "@/api/FilesAPI"

    import VueCookies from 'vue-cookies'
    Vue.use(VueCookies)

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
            TemplateDialog,
            MetadataDialog,
            
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
                api:"",
                metedataResults:[],
                mloading:false,
                dateTime:"",
                selectedtag: null,
                csvloading:false,
                csvlocation:null,
                
                
                // -- selected files table
                selectedFilesTable: {
                    headers: [
                        { text: 'Job Name', value: 'series.path' }
                    ],
                },

                psfTypes: [
                    {label: 'Widefield', value: 0},
                    {label: 'Confocal', value: 1},
                    {label: 'Two Photon', value: 2},
                    {label: 'Light Sheet', value: 3},  
                    {label: 'Spinning Disk', value: 4}, 
                    {label: 'Re-scan Confocal', value: 6}, 
                    {label: 'iSIM', value: 7}, 
                    {label: 'SoRa', value: 8}, 
                    {label: 'NL5', value: 9}, 
                    {label: 'RCM2', value: 10}, 
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
            
            let _current_api = await PreferenceAPI.get_config()
            this.api=_current_api.apiname
            this.selectedtag = _current_api.metadatatag
            console.log(this.api)
            let initialItems = []
            let _decons = await PreferenceAPI.get_decons(null,this.api)
            for (let _index =0; _index < _decons.length; _index++){
                let _decon = _decons[_index]
                _decon.series = await PreferenceAPI.get_serie_by_id(_decon.series_id)
                _decon.setting = await PreferenceAPI.get_setting_by_id(_decon.setting_id)
                _decon.setting = series.formatSeries(_decon.setting)
                initialItems.push(_decon)
                //initialItems[_index].tempID = new Date().getMilliseconds()
                initialItems[_index].tempID = this.uuid()
            }
            this.loaded = this.loaded.concat(initialItems)
            
            let filepath = []
            
            // for though loaded, add to selected if needeed
            this.loaded.forEach(async item => {
                if(item.selected) {
                    this.selected.push(item)           
                    this.display_decon(item)    
                }
                
                if (!filepath.includes(item.series.path)) {
                    filepath.push(item.series.path)
                }
                
            })
            filepath.forEach (async item => {
                let _pathParts = item.split("/")
                let basename = _pathParts.slice(-1)[0]
                if (basename.includes('*')) {
                    let path = _pathParts.slice(0,-1).join("/")+ "/"
                    this.mloading = true
                    await this.loadMetadaFolder(path,basename)
                    this.mloading = false
                }else {
                    this.mloading = true
                    let results = await this.getMetadata(item, false)
                    if(results) {
                        this.metedataResults.push(results[0])
                    }
                    this.mloading = false
                }
            })
            
            if(this.selected.length > 0) {
                this.workingItem.setting.filepath = this.selected[0].series.path
                this.$cookies.set('filepath',this.selected[0].series.path, new Date(9999, 0o1, 0o1).toUTCString())
            }
           
            if(this.api == 'CudaDecon') {
                this.workingItem.setting.psfType = 3
            }
            console.log("this.selected")
            console.log(this.selected)
            
        },
        methods: {

            uuid(){
                let uuidValue = "",k, randomValue;
                for (k=0; k< 32; k++) {
                    randomValue = Math.random() * 16 | 0;
                    if (k == 8 || k==12 || k == 16 || k==20) {
                        uuidValue += "-"
                    }
                    uuidValue += (k == 12 ? 4 : (k==16 ? (randomValue & 3 | 8) : randomValue)).toString(16);
                }
                return uuidValue

            },
            /**
             * save settings from workingItem back to selected, and save to db
             */
            saveSettings(){
                
                this.selected.forEach(decon => {
                    decon.setting = Object.assign({}, this.workingItem.setting)
                    decon.step = this.workingItem.step
                    decon.visitedSteps = this.workingItem.visitedSteps
                    decon.api = this.api
                    // save it
                    PreferenceAPI.update_decon(decon.id, decon)
                })
               
            },

            async downloadToCSV(metadataResult){
                //let json_data = JSON.stringify(metadataResult)
               
                let file_name = metadataResult.file.split("/").slice(-1)[0].split(".")[0]
                let saveFolder = this.workingItem.setting.outputPath
                
                try{
                    this.csvloading = true
                    const response= await ConfigurationAPI.execute_metedata_script(btoa(metadataResult.file), this.selectedtag, false, true, btoa(saveFolder))
                    this.csvloading = false
                    this.csvlocation = this.workingItem.setting.outputPath+"/"+file_name+"_metadata.csv"
                    console.log(this.workingItem.setting.outputPath+"/"+file_name+".csv")
                    console.log(response)
                    //if(response)
                    Vue.notify({
                            group: 'sysnotif',
                            type: 'info',
                            title: 'Save Metadata to CSV File',
                            text: this.workingItem.setting.outputPath+"/"+file_name+"_metadata.csv" + ' saved!'
                        });

                }
                catch(err){
                        Vue.notify({
                            group: 'sysnotif',
                            type: 'error',
                            title: 'Save Metadata to CSV File',
                            text: 'Fail to save ' + this.workingItem.setting.outputPath+"/"+file_name+"_metadata.csv"  + ' .Error:' + String(err)
                        });
                        console.log(String(err))
                    } 
                console.log(this.workingItem.setting.outputPath)
            },


            /****************************************************************************** */
            /** this part loads files/folders  **/
            // this is different from display_decon
            async load_path(pathToBeLoaded, isfolder) {
                
                let items = []
                try{
                    let _decons = []
                    console.log(btoa(pathToBeLoaded))
                    if(!this.isSame) {
                        _decons = await PreferenceAPI.get_decons(pathToBeLoaded,this.api)
                        // found
                        Vue.$log.info(_decons)

                   
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
                        }else {
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
                                        Vue.$log.debug("Not found in database- a new decon and path")
                                        let response = null
                                        console.log(pathToBeLoaded)
                                        if (isfolder)
                                            response = await DeconvolutionAPI.get_folder_info(pathToBeLoaded)
                                        else 
                                            response = await DeconvolutionAPI.get_file_info(pathToBeLoaded)

                                        console.log("after response call")
                                        console.log(response)
                                        console.log(JSON.parse(JSON.stringify(response)))
                                       
                                        Vue.$log.debug("Response :")
                                        Vue.$log.debug(response)
                                        Vue.$log.debug(JSON.parse(JSON.stringify(response)))

                                        // add to database
                                        for(let _index = 0; _index < response.commandResult.length; _index++){
                                            console.log("adding new docn to db")
                                            let _responseItem  = response.commandResult[_index]
                                            _responseItem.isfolder = isfolder
                                            console.log(_responseItem)
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
                                        }    // end for
                                    } // end not found in db
                            }
                    }
                    else {
                        Vue.$log.debug("Same path. Do one more search from series")
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
                        }
                    }
                Vue.$log.debug("items :")
                Vue.$log.debug(items)
                console.log(items)
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
                
                this.csvlocation = null
                let options = null
                
                if (isfolder)
                    options = await this.$refs.filedialog.open('selectfilesinfolder', 'Deconvolution', '/')

                else 
                    options = await this.$refs.filedialog.open('selectfiles', 'Deconvolution', '/')
                if (!options.cancelled) {
                    let paths = []
                    if(isfolder){
                        let _pathToBeLoaded = options.path + options.filter
                        Vue.$log.debug("selecting series:" + _pathToBeLoaded + "max size" + options.maxsize)
                        //let _exist = false
                        this.loaded.map(file => {
                            if (file.series.path === _pathToBeLoaded){
                                // _exist = true
                                this.isSame = true
                            }
                            else {
                                this.isSame = false
                            }
                               
                        })
                        console.log(miscs.maxMemSize())
                        if(options.maxsize * 2.2 > miscs.maxMemSize()){
                            Vue.notify({
                                group: 'sysnotif',
                                type: 'warning',
                                title: 'Unable to add file',
                                text: 'This series require too much memory to run! This series cannot be added'
                            })
                            return
                        }
                        paths.push(_pathToBeLoaded)
                        console.log("folder paths")
                        console.log(paths)
            
                    } else {
                        Vue.$log.debug("selecting files:")
                        Vue.$log.debug(options.selectedItems)
                        
                        for(let i = 0; i< options.selectedItems.length; i++){
                            //let _exists = false
                            this.loaded.map(file => {
                                if (file.series.path === options.selectedItems[i].path){
                                   this.isSame = true
                                }
                                else {
                                    this.isSame = false
                                }
                                
                            })
                            //if (!_exists)
                            let itemSize = miscs.convertFormattedStrToBytes(options.selectedItems[i].size)
                            console.log(miscs.maxMemSize())
                            console.log(itemSize* 2.2)
                            if(itemSize * 2.2 > miscs.maxMemSize()){
                                Vue.notify({
                                    group: 'sysnotif',
                                    type: 'warning',
                                    title: 'Unable to add file',
                                    text: 'This series require too much memory to run! This series cannot be added'
                                })
                                return
                            }
                            
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
                        //this.tempID = new Date().getMilliseconds()
                        if(items[i]) {
                            items[i].tempID = this.uuid()
                        }
                        //items[i].tempID = this.uuid()
                        this.loaded = this.loaded.concat(items)
                        
                    }
                    
                    if ((!this.selected || this.selected.length ==0) && this.loaded.length > 0){
                        this.selected = [ this.loaded[0] ]
                        this.display_decon(this.loaded[0])
                    }
                    this.loading = false     
                    if (isfolder) {
                        this.mloading = true
                        await this.loadMetadaFolder(options.path,options.filter)
                        this.mloading = false
                    }else {
                        console.log(this.metedataResults)
                        const found =  this.metedataResults.some(el => el.file === paths[0])
                        if(!found) {
                            this.mloading = true
                            let results = await this.getMetadata(paths, true)
                            if(results.length > 0) {
                                results.forEach(item => {
                                    this.metedataResults.push(item)
                                }) 
                            }
                            this.mloading = false
                        }
                        
                    }

                }
                
            },
            async loadMetadaFolder(path, filter){
                let files = []
                let response = await FilesAPI.list(path);
                console.log(response)
                if(response.commandResult) {
                    response.commandResult.forEach(item =>{
                        if(!(['d', 'l'].includes(item.permission.charAt(0)))){
                            if(filter.startsWith('*') && filter.endsWith('*')){
                                if(item.name.includes(filter.replaceAll('*','').trim())){
                                    files.push(path+item.name)
                                }
                            }
                            else if(filter.endsWith('*') && !filter.startsWith('*')){
                                if(item.name.startsWith(filter.replace('*','').trim())){
                                    files.push(path+item.name)
                                }
                            }else{
                                if(item.name.endsWith(filter.replace('*','').trim())){
                                    files.push(path+item.name)
                                }
                            }
                        }

                    })
                    if (files.length > 0) {
                        const found =  this.metedataResults.some(el => el.file === files)
                        if(!found) {

                            let results = await this.getMetadata(files, true)
                            console.log(results)
                            if(results.length > 0) {
                                results.forEach(item => {
                                    this.metedataResults.push(item)
                                }) 
                            }
                        }
                        
                    }
                }
            },


            /**
             * called when select single files
             */
            async selectFiles(){
                await this.selectFilesOrFolders(false)
                this.workingItem.setting.isfolder=false
                /* let filepath = this.loaded[0].series.path
                
                let results = await this.getMetadata(filepath, false)
                this.metedataResults.push(results[0])
                console.log( this.metedataResults ) */
                /* let options = await this.$refs.metadatadialog.open(metedataResults[0])
                if (!options.cancelled) {
                    Vue.$log.info("Metadata loaded")
                    Vue.$log.info(options.settings)
                   
                    
                }  */
            },
            /**
             * select series
             */
            async selectFilesInFolder(){
                await this.selectFilesOrFolders(true)
                this.workingItem.setting.isfolder=true
                
            },

            /**
             * display metadata
             */

            async getMetadata(fileslist, folder) {
                let fileslistbase64 = ''
                let saveFolder=''
                
                if (!folder) {
                    fileslistbase64 = btoa(fileslist)
                } else {
                    for (let i=0 ; i< fileslist.length; i++) {
                        fileslistbase64 = fileslistbase64 + fileslist[i]+ ";"
                    }
                    fileslistbase64 = btoa(fileslistbase64.substring(0,fileslistbase64.length-1))
                }
                console.log("file list base")
                console.log(fileslistbase64)

                try{
                    console.log(this.selectedtag)
                    const response= await ConfigurationAPI.execute_metedata_script(fileslistbase64, this.selectedtag, false, false, saveFolder)
                    console.log(response)
                    let output = response.commandResult
                    if (output.length > 0) {
                        let json_output =  JSON.parse(output[0].out)
                        console.log(json_output)
                        if(json_output.results.success){
                            return json_output.results.metadata
                        }
                    }
                    
                }
                catch(err){
                    return "Error occured" + err
                }
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
                    if(this.outputpath) {
                        for(let i = 0; i < this.outputpath.length; i++){
                            if(this.outputpath[i].id === item.id) {
                                this.outputpath.splice(i,1)
                            }
                        }
                    } 
                    for(let i=0; i< this.metedataResults.length ; i++) {
                        if(this.selected[0].series.path === this.metedataResults[i].file) {
                            this.metedataResults.splice(i, 1)
                        }
                    }
                    
                })
                this.selected = []
                // load an empty one
                this.workingItem = series.defaultDecon()
                this.display_decon(this.workingItem, false)
                this.csvlocation = null
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
                this.outputpath = []
                this.workingItem = series.defaultDecon()
                console.log( this.workingItem)
                this.display_decon(this.workingItem, false)
                this.metedataResults = []
                this.csvlocation = null
            },
            /* end part dealing with load */
            /****************************************************************************** */



            /****************************************************************************** */
            /** submit job */
            async submitSingleJob(item){

                let _current_api = await PreferenceAPI.get_config()
                
                
                let _numberOfJobs = parseInt(item.setting.instances)
                let _jobs = await PreferenceAPI.create_decon_jobs(item.id, _numberOfJobs)
                let _jobIds = _jobs.map(_job => {
                    return _job.id
                })
                
                if(item.setting.psfType !== 3) {
                    item.setting.deskew = false
                }
                
                console.log(_jobIds)
                try{
                    if (_current_api &&  _current_api.apiname=="Microvolution") {
                        await DeconvolutionAPI.execute_microvolution(item.setting.outputPath, _numberOfJobs, 
                                        item.setting.mem, item.setting.gpus, item, _jobIds, false, false, false)
                    } else if(_current_api &&  _current_api.apiname=="CudaDecon") {
                        await DeconvolutionAPI.execute_microvolution(item.setting.outputPath,_numberOfJobs, item.setting.mem, item.setting.gpus, item, _jobIds, false, false, true)
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
                    
                }
            },
            /**
             * submit all the series
             * when this is called, it means all series are valid
             */
            async submitAll(){
                for (let i=0; i< this.loaded.length; i++) {
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
                //duplicate = this.duplicate
                
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
                        
                        if(!decon.series.padding) {
                            if (!decon.setting.filepath){
                                decon.setting.filepath = decon.series.path
                            }
                            _acomponent.load_serie(decon.setting)
                            //_acomponent.get_serie()

                        } else {
                            _acomponent.load_serie(decon.series) //previous decon.setting
                        }
                        if(!_acomponent.is_valid())
                            _anyInvalidStep = true
                    }
                })
                if(this.workingItem.setting.psfType !== 3 ){
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
                //anItem.item.selected = anItem.value
                if (anItem.value){
                    // console.log("selecting ...." + anItem.item.series.path)
                    if ( this.singleSelect ) {
                        this.selected = [ anItem.item ]
                        this.display_decon(anItem.item)
                        this.$cookies.set('filepath',anItem.item.series.path, new Date(9999, 0o1, 0o1).toUTCString())
                        //save
                    }
                    else {
                        // not sure what to do here:
                        // load anItem to workingItem is nothing loaded
                        // otherwise do nothing --> meaning any change will write back to anItem
                        Vue.$log.info("TODO here")
                    }
                    //this.saveSettings()
                    PreferenceAPI.update_decon(anItem.item.id, anItem.item)
                    
                }
                    
                else {
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
                this.errors = []
                if (this.workingItem.setting.psfType !== 3 ) {
                    this.workingItem.setting.deskew = false
                    this.workingItem.setting.keepDeskew = false
                }
                this.saveSettings()
                // is this needed
                this.display_decon(this.workingItem, false)
            },
            changeColor(color) {
                document.body.style.background = color
            },

            stepClicked() {
                
                this.workingItem.step = parseInt(this.workingItem.step)
                if(!this.checkStepVisibility(this.workingItem.step))
                    return
                if(this.workingItem.visitedSteps.indexOf(this.workingItem.step) < 0)
                    this.workingItem.visitedSteps.push(this.workingItem.step)
                console.log("this.workingItem.step")
                console.log(this.workingItem.step)
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
                // load series to new step
                if(this.workingItem.selected){
                    let _component = this.getStepComponent(stepNumber)
                    if (_component)
                        _component.load_serie(this.workingItem.setting)
                    PreferenceAPI.update_decon(this.workingItem.id, this.workingItem)   
                }
            },

            
            async nextStep(){
                this.workingItem.step = parseInt(this.workingItem.step)
                
                if(this.workingItem.step === 1) {
                    console.log("this working item wen series")
                    console.log(this.workingItem)
                    console.log(this.outputpath)
                    let item ={}
                    item.id = this.workingItem.id
                    item.outputpath = this.workingItem.setting.outputPath
                    if(this.outputpath.length === 0) {
                        this.outputpath.push(item)
                        console.log(this.outputpath)
                    }else{
                        let flag = false
                        let tempID = -1
                        for(let i=0; i<this.outputpath.length; i++){
                            if((this.outputpath[i].id !== this.workingItem.id) && (this.outputpath[i].outputpath === this.workingItem.setting.outputPath)){
                                Vue.notify({
                                    group: 'errornotif',
                                    type: 'error',
                                    title: 'Input Error',
                                    text: "Jobs with the same name/path must have unique Output paths/folders to avoid overwrite",
                                    closeOnClick: true
                                })
                                flag = true
                                console.log(this.outputpath)
                                return
                            }else {
                                if(this.outputpath[i].id === this.workingItem.id){
                                    tempID = i
                                    console.log(this.outputpath)
                                }
                               
                                
                            }
                        }
                        if(!flag){
                            console.log(flag)
                            console.log(this.outputpath)

                            if(tempID === -1){
                                console.log(this.outputpath)
                                this.outputpath.push(item)
                            } else {
                                console.log(this.outputpath)
                                this.outputpath[tempID].outputpath = this.workingItem.setting.outputPath
                               
                            }
                        }
                        
                    }
                   

                }
                if(this.workingItem.step === 4) {
                    let channels = this.workingItem.setting.channels
                    let psfType = this.workingItem.setting.psfType
                    let pinhole = 0
                    let pinhole_spacing = 0
                    for (let i=0; i< channels.length; i++) {
                        pinhole = channels[i].pinhole
                        pinhole_spacing = channels[i].pinholeSpacing
                        let iteration = channels[i].iterations
                        if (iteration === 0) {
                            this.workingItem.setting.channels[i].pinhole = 0
                            this.workingItem.setting.channels[i].pinholeSpacing = 0
                            this.workingItem.setting.channels[i].wavelength = 0

                        }
                        else if (psfType === 1 || psfType === 6 ) {
                            this.errors = []
                            if (iteration > 0 && pinhole === 0) {
                               
                                Vue.notify({
                                    group: 'errornotif',
                                    type: 'error',
                                    title: 'Input Error',
                                    text: "Invalid Channel "+(i+1)+ " pinhole radius: 0",
                                    closeOnClick: true
                                })
                                return
                            } 
                        }
                            
                        else if (psfType === 4 || psfType === 7 || psfType === 8) {
                            this.errors = []
                            if (iteration > 0 && (pinhole === 0 || pinhole_spacing === 0)) {
                                
                                Vue.notify({
                                    group: 'errornotif',
                                    type: 'error',
                                    title: 'Input Error',
                                    text: 'Invalid pinhole radius and pinhole spacing: 0',
                                    closeOnClick: true
                                })
                                return
                            }
                            
                        }
                    } 
                }
               /* validate devices in device tab */
                if(this.workingItem.step === 7) { 
                    let msg 
                    let jobs = this.workingItem.setting.instances
                    let mem = this.workingItem.setting.mem
                    let gpus = this.workingItem.setting.gpus
                    console.log(jobs)
                    console.log(mem)
                    console.log(gpus)

                    
                    this.overlay =true
                    let response = await DeconvolutionAPI.validate_devices(jobs,mem,gpus)
                    this.overlay =false
                    let output = response.commandResult
                    console.log(output)
                    if (output.length > 0) {
                        let json_output =  JSON.parse(output[0].out)
                        if(!json_output.results.success){
                            let limit_test =  json_output.results.limits_test.success
                            let slurm_test = json_output.results.slurm_test.success
                            if (!limit_test && !slurm_test || !limit_test && slurm_test){
                                msg = json_output.results.limits_test.msg
                            }
                            else if (limit_test && !slurm_test) {
                                msg = json_output.results.slurm_test.msg
                            }
                            Vue.notify({
                                group: 'errornotif',
                                type: 'error',
                                title: 'Device Selection Error',
                                text: msg.charAt(0).toUpperCase() + msg.slice(1)
                            })
                            return 
                        }
                    }
                } 
                if(this.workingItem.step === 8)
                    return
                //even if current step is invalid, next will allow it to go if it has been visited
                if(!this.getStepComponent(this.workingItem.step).is_valid())
                    return
                let previousStep = this.workingItem.step
                // add to visited
                if (this.workingItem.step !== 8){
                    // only access to 3 if psfType = 3
                    /* if(this.workingItem.setting.psfType === 3 || this.workingItem.step !== 2)
                        this.workingItem.step = this.workingItem.step + 1
                    if(this.api==='CudaDecon' && this.workingItem.step ===4)
                        this.workingItem.step = 7
                    else
                        this.workingItem.step = 4 */

                    if (this.api === 'Microvolution') {
                        if(this.workingItem.setting.psfType === 3 || this.workingItem.step !== 2)
                            this.workingItem.step = this.workingItem.step + 1
                        else
                            this.workingItem.step = 4
                    } else {
                        if (this.workingItem.step === 4) 
                            this.workingItem.step = 7
                        else
                            this.workingItem.step = this.workingItem.step + 1
                    }   
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
                if (_component) {
                    console.log(this.selected[0])
                    this.workingItem.setting.filepath = this.selected[0].series.path
                    _component.load_serie(this.workingItem.setting)
                }
               


                  
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