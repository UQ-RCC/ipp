<template>
    <v-card  :loading="loading > 0">
    <v-form
    ref="form"
    v-model="form.valid"
    lazy-validation
    >
    <file-browser-dialog ref="filedialog" />
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

                    <v-checkbox
                        v-model="form.seperateOutputsBasedonInput"
                        label="Separate outputs based on input paths"
                    ></v-checkbox>

                </div>
            </v-col>
            <v-divider vertical></v-divider>
            <v-col
                class="d-flex"
            >
                <v-tabs centered top @change="tabChanged">
                    <v-tab>
                        <v-icon left>mdi-check-all</v-icon>
                        Main
                    </v-tab>
                    <v-tab>
                        <v-icon left>mdi-arrow-down-circle-outline</v-icon>
                        Noise Suppression
                    </v-tab>
                    <v-tab>
                        <v-icon left>mdi-settings</v-icon>
                        Advanced
                    </v-tab>
                    <v-tab>
                        <v-icon left>mdi-server</v-icon>
                        Devices
                    </v-tab>

                    <v-tab-item>
                        <v-card flat>
                            <p />
                            <deconvolution-main ref="deconmain"
                                                :selectedSerie = selected[0]?selected[0]:this.init_selected_serie_or_file(null)
                            />
                        </v-card>
                    </v-tab-item>
                    <v-tab-item>
                        <v-card flat>
                            <p />
                            <deconvolution-noise ref="deconnoise"
                                                 :selectedNoise = selected[0]?selected[0]:this.init_selected_serie_or_file(null)
                            />
                        </v-card>
                    </v-tab-item>
                    <v-tab-item>
                        <v-card flat>
                            <p />
                            <deconvolution-advanced ref="deconadvanced"
                                                    :selectedAdvanced = selected[0]?selected[0]:this.init_selected_serie_or_file(null)
                            />
                        </v-card>
                    </v-tab-item>
                    <v-tab-item>
                        <v-card flat>
                            <p />
                            <deconvolution-devices ref="decondevices"
                                                    :selectedDevices = selected[0]?selected[0]:this.init_selected_serie_or_file(null)
                            />

                        </v-card>
                    </v-tab-item>
                </v-tabs>
                
            </v-col>
        </v-row>
        <v-divider horizontal></v-divider>
        <v-row align="center" justify="center">
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn 
                        class="my-3" 
                        color="primary" 
                        @click.stop="submit"
                        rounded dark large 
                        v-bind="attrs" v-on="on">
                        Submit
                    </v-btn>
                </template>
                <span>Submit for processing</span>
            </v-tooltip>

            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn 
                        class="my-3" 
                        color="primary" 
                        @click.stop="saveTemplate"
                        rounded dark large 
                        v-bind="attrs" v-on="on">
                        Save Template
                    </v-btn>
                </template>
                <span>Save the template of the currently selected series</span>
            </v-tooltip>

            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn 
                        class="my-3" 
                        color="primary" 
                        @click.stop="loadTemplate"
                        rounded dark large 
                        v-bind="attrs" v-on="on">
                        Load Template
                    </v-btn>
                </template>
                <span>Load a template and apply to the currently selected series</span>
            </v-tooltip>
        </v-row>
    </v-form>
    </v-card>    
</template>

<script>
    import Vue from 'vue';
    // import * as api from '@/api'
    import FileBrowserDialog from '../components/FileBrowserDialog.vue'
    import DeconvolutionMain from '../components/deconvolution/Main.vue'
    import DeconvolutionNoise from '../components/deconvolution/NoiseSupression.vue'
    import DeconvolutionAdvanced from '../components/deconvolution/Advanced.vue'
    import DeconvolutionDevices from '../components/deconvolution/Devices.vue'
    // api
    import DeconvolutionAPI from "@/api/DeconvolutionAPI.js";
    // import PreferenceAPI from "@/api/PreferenceAPI";
    import { roundToTwo } from "@/utils/miscs.js";

    export default {
        name: 'Deconvolution',
        components: {
            FileBrowserDialog,
            DeconvolutionMain,
            DeconvolutionNoise,
            DeconvolutionAdvanced,
            DeconvolutionDevices
        },
        data() {
            return {
                // ---- form specific
                loading: false,
                form: {
                    valid: true,
                    outputBasePath: '',
                    outputFolderName: '',
                    seperateOutputsBasedonInput: false,
                    psfType: {label: 'Light Sheet', value: 3},
                    currentTab: 0
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

                // things to be saved - really
                selected: [],
                selectedFiles: [],

            }
        },
        mounted: function() {
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
                        this.selected[0].outputBasePath = this.form.outputBasePath
                        this.selected[0].outputFolderName = this.form.outputFolderName
                    }
                }
            },
            async selectFiles(){
                let options = await this.$refs.filedialog.open('selectfiles', 'Deconvolution', '/');
                if (!options.cancelled) {
                    Vue.$log.info("...........");
                    Vue.$log.info(options.path);
                    // selectedItem.path points to file
                    Vue.$log.info(options.selectedItems);
                }

            },
            async selectFilesInFolder(){
                let options = await this.$refs.filedialog.open('selectfilesinfolder', 'Deconvolution', '/');
                if (!options.cancelled) {
                    Vue.$log.info("selecting files:" + options.path + options.filter);
                    this.loading = true;
                    try{
                        //TODO:  set loading
                        this.loading = true;
                        let response = await DeconvolutionAPI.get_folder_info(options.path + options.filter);
                        Vue.$log.info("Response :")
                        Vue.$log.info(JSON.parse(JSON.stringify(response)))
                        let items = response.commandResult.map(responseItem => {
                            return this.init_selected_serie_or_file(responseItem)
                        });
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
                    for(var i=1; i <=this.selectedFiles.length; i++){
                        console.log(this.selected[0]['path'])
                        console.log(this.selectedFiles[i]['path'])
                        if (this.selectedFiles[i]['path'] === this.selected[0]['path']){
                            this.selectedFiles.splice(i, 1)
                            // load new one
                            if (this.selectedFiles.length > 0){
                                this.selected = [ this.selectedFiles[0] ]
                                this.load_series(this.selectedFiles[0])
                            }
                        }// end if
                    }// end for
                }
            },
            // remove all series
            removeAll(){
                this.selectedFiles = []
                this.selected = []
                this.load_series(this.init_selected_serie_or_file(null))
            },
            submit(){
                console.log("submit...");
            },
            saveTemplate(){
                console.log("save...");
            },
            loadTemplate(){
                console.log("load...");
            },
            
            // load series
            load_series(series){
                // update tab
                switch(this.form.currentTab) {
                    case 1:
                        this.$refs.deconnoise.load_new_series(series)
                        break
                    case 2:
                        this.$refs.deconadvanced.load_new_series(series)
                        break
                    case 3:
                        this.$refs.decondevices.load_new_series(series)
                        break
                    default: 
                        this.$refs.deconmain.load_new_series(series)
                        break
                }
                // update form
                this.form.outputBasePath = series['outputBasePath']
                this.form.outputFolderName = series['outputFolderName']
                this.form.seperateOutputsBasedonInput = series['seperateOutputsBasedonInput']
                this.form.psfType = series['psfType']
            },

            //anItem looks like this { item: any, value: boolean }
            async selectedChanged(anItem){
                // selected
                //TODO: save pref on this.selected
                if(this.selected && this.selected[0]){
                    this.selected[0]['outputBasePath'] = this.form.outputBasePath
                    this.selected[0]['outputFolderName'] = this.form.outputFolderName
                    this.selected[0]['seperateOutputsBasedonInput'] = this.form.seperateOutputsBasedonInput
                }
                // if selected, load it
                if (anItem.value){
                    console.log(anItem)
                    this.load_series(anItem.item)
                }
            }, 

            // psf type changed
            psfChanged(){
                if(this.selected && this.selected[0]){
                    this.selected[0]['psfType'] = this.form.psfType
                    this.load_series(this.selected[0])
                }
            },

            // tab changed
            tabChanged(number){
                // save value before switch
                let currentDeconTab = null
                switch(this.form.currentTab) {
                        case 1:
                            currentDeconTab = this.$refs.deconnoise
                            break
                        case 2:
                            currentDeconTab = this.$refs.deconadvanced
                            break
                        case 3:
                            currentDeconTab = this.$refs.decondevices
                            break
                        default: 
                            currentDeconTab = this.$refs.deconmain
                            break
                }
                // switch
                let newDeconTab = null
                switch(number) {
                        case 1:
                            newDeconTab = this.$refs.deconnoise
                            break
                        case 2:
                            newDeconTab = this.$refs.deconadvanced
                            break
                        case 3:
                            newDeconTab = this.$refs.decondevices
                            break
                        default: 
                            newDeconTab = this.$refs.deconmain
                            break
                }
                Vue.$log.info(newDeconTab)
                this.form.currentTab = number
                if(this.selected && this.selected[0]){
                    this.selected[0] = currentDeconTab.get_series_modified()
                    if(newDeconTab)
                        newDeconTab.load_new_series(this.selected[0])
                }
            },    

            // init default values for selected series
            init_selected_serie_or_file(item){
                if (!item) {
                    item = {}
                }
                //////// main tab
                // init channels if none
                if (!item['channels']) {
                    try{
                        let numOfChannels = parseInt(item['c']);
                        let channels = []
                        for(var i=1; i <=numOfChannels; i++){
                            var channelName = 'Channel ' + i;
                            channels.push({'name': channelName, 'iterations': 10,
                                            'wavelength': 525, 'pinhole': 0, 'background': 0})
                        }
                        item['channels'] = channels;
                    }catch(err){
                        // ignore
                    }
                } 
                // name
                item['name'] = item['path']
                
                // swapZT
                if(item['z']==1 && item['t']>10){
                    item['swapZT'] = true;
                } else {
                    item['swapZT'] = false;
                }
                // output
                if(item['defaultoutput']){
                    var _pathParts = item['defaultoutput'].split("/")
                    item['outputBasePath'] = _pathParts.slice(0,-1).join("/")
                    item['outputFolderName'] = _pathParts.slice(-1)[0]
                } else {
                    item['outputBasePath'] = ""
                    item['outputFolderName'] = ""
                }
                item['seperateOutputsBasedonInput'] = false
                
                item['generatePsf'] = false
                item['readSpacing'] = true
                item['psfModel'] = {label: 'Scalar', value: 0}
                item['RI'] = 1.33
                item['objectiveRIOption'] = 1.33
                item['ns'] = 1.33
                item['mediumRIOption'] = 1.33
                item['NA'] = 1.4
                item['lightSheetIlluminationNA'] = 0.5
                item['psfFile'] = ''
                item['psfInfo'] = {}
                item['deskew'] = true
                item['keepDeskew'] = false
                item['angle'] = 32.8
                item['median_threshold'] = roundToTwo(item['threshold'])
                item['deskewMetadata'] = [
                    {   
                        unit: item['unit'], 
                        pixelWidth: item['pixelW'],
                        pixelHeight: item['pixelH'], 
                        voxelDepth: item['pixelD'] 
                    }
                ]
                item['backgroundType'] = {'label': 'None', 'value': null}
                item['swapPsfZT'] = false
                item['saveEveryIterations'] = 0
                // format
                item['dr'] = roundToTwo(item['dr'])
                item['dz'] = roundToTwo(item['dz'])
                //
                item['psfType'] = 3
                
                /////////// NOISE
                item['regularizationType'] = {'label': 'None', 'value': 0}
                item['prefilter'] = 0
                item['postfilter'] = 0
                item['automaticRegularizationScale'] =  true
                item['regularization'] = -1
                //////////////ADVANCED
                item['blindDeconvolution']= false
                item['padding'] = {x: 0, y: 0, z: 0}
                item['tiling'] =  {x: 0, y: 0, z: 0}
                item['scaling'] =  {'label': 'Same as input', 'value': 1}
                item['fileformat'] = {'label': 'TIFF', 'value': 0}
                item['split'] =  {'label': 'No Split', 'value': 0}
                item['splitIdx'] = {'label': '0', 'value': 0}
                /////// DEVICES
                item['autoDetect']= false
                item['numberOfParallelJobs']= 1
                item['mem']= 100
                item['gpus'] = 1

                return item;
            },
        },
    }
</script>