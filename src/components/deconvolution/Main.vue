<template>
    <v-form
        ref="mainform"
        v-model="valid"
        lazy-validation
        >
    
        <file-browser-dialog ref="filedialog" />

        <v-expansion-panels
        v-model="panel"
        multiple
        >
            <v-expansion-panel>
                <v-expansion-panel-header>Metadata</v-expansion-panel-header>
                <v-expansion-panel-content>
                        <v-row align="center" justify="center">    
                            <v-col cols="20" sm="4" md="5">
                                <v-text-field regular label="Lateral spacing(nm/pixel)" v-model="serie.dr">
                                </v-text-field>
                                <v-text-field regular label="Axial spacing(nm/slice)" v-model="serie.dz">
                                </v-text-field>
                            </v-col>
                            <v-row align="center" justify="center">
                                <v-switch
                                    v-model="serie.readSpacing"
                                    label="Read spacing from metadata"
                                    >
                                </v-switch>
                            </v-row>
                        </v-row>
                        <v-row>
                            <v-col cols="5" sm="2" md="2">
                                X: {{ serie.x }}
                            </v-col>
                            <v-col cols="5" sm="2" md="2">
                                Y: {{ serie.y }}
                            </v-col>
                            <v-col cols="5" sm="2" md="2">
                                Z: {{ serie.swapZT ? serie.t: serie.z }}
                            </v-col>
                            <v-col cols="5" sm="2" md="2">
                                C: {{ serie.c }} 
                            </v-col>
                            <v-col cols="5" sm="2" md="2">
                                T: {{ serie.swapZT ? serie.z: serie.t }}
                            </v-col>
                            <v-switch
                                v-model="serie.swapZT"
                                label="Swap Z and T dimensions"
                                >
                            </v-switch>
                        </v-row>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
                <v-expansion-panel-header>PSF</v-expansion-panel-header>
                <v-expansion-panel-content>
                    <v-row align="center" justify="center">
                        <v-switch
                            v-model="serie.generatePsf"
                            label="Generate PSF"
                            >
                        </v-switch>
                    </v-row>
                    
                    <v-col v-if="serie.generatePsf">
                        <v-row>
                            <v-col cols="15" sm="3" md="4">
                                <v-select
                                    :items="psfModels"
                                    v-model="serie.psfModel"
                                    item-text="label"
                                    item-value="value"
                                    label="PSF Model"
                                    outlined
                                    return-object
                                    >
                                </v-select>
                            </v-col>
                            <v-row v-if="serie.psfModel.value!==0">
                                <v-col cols="20" sm="4" md="5">
                                    <v-text-field 
                                        v-model="serie.ns"
                                        @change="nsChanged"
                                        regular 
                                        label="Sample medium refractive index" 
                                        type="number">
                                    </v-text-field>
                                </v-col>

                                
                                <v-col cols="15" sm="3" md="4">
                                    <v-select
                                        :items="mediumRIOptions"
                                        v-model="serie.mediumRIOption"
                                        item-text="label"
                                        item-value="value"
                                        label="Sample medium RI options"
                                        @change="mediumRISelect"
                                        outlined
                                        single-line
                                        return-object
                                        >
                                    </v-select>
                                </v-col>

                            </v-row>
                            
                        </v-row>
                        <v-row>
                            <v-col cols="15" sm="3" md="4">
                                <v-text-field regular label="Objective NA" type="number" v-model="serie.NA">
                                </v-text-field>
                            </v-col>
                            <v-col cols="15" sm="3" md="4">
                                <v-text-field regular label="Light sheet illumination NA" type="number" v-model="serie.lightSheetIlluminationNA">
                                </v-text-field>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="15" sm="3" md="4">
                                <v-text-field 
                                    v-model="serie.RI"
                                    @change="RIChanged"
                                    regular 
                                    label="Objective immersion refractive index" 
                                    type="number">
                                </v-text-field>
                            </v-col>
                            <v-col cols="15" sm="3" md="4">
                                <v-select
                                    :items="objectiveRIOptions"
                                    v-model="serie.objectiveRIOption"
                                    item-text="label"
                                    item-value="value"
                                    label="Presets"
                                    @change="objectiveRISelect"
                                    outlined
                                    single-line
                                    return-object
                                    >
                                </v-select>
                            </v-col>
                        </v-row>

                    </v-col>


                    <v-col v-if="!serie.generatePsf">
                        <v-row align="center" justify="center">
                            <v-col cols="30" sm="6" md="7">
                                <v-text-field regular label="PSF file" v-model="serie.psfFile">
                                </v-text-field>
                            </v-col>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn 
                                        class="my-3" 
                                        color="primary" 
                                        fab dark large 
                                        @click.stop="choosePsfFile"
                                        v-bind="attrs" 
                                        v-on="on">
                                        <v-icon>mdi-file-find</v-icon>
                                    </v-btn>
                                </template>
                                <span>Choose a PSF file</span>
                            </v-tooltip>
                        </v-row>
                        <v-row>
                            <v-col cols="5" sm="2" md="2">
                                X: {{ serie.psfInfo.x }}
                            </v-col>
                            <v-col cols="5" sm="2" md="2">
                                Y: {{ serie.psfInfo.y }}
                            </v-col>
                            <v-col cols="5" sm="2" md="2">
                                Z: {{ serie.swapPsfZT ? serie.psfInfo.t: serie.psfInfo.z }}
                            </v-col>
                            <v-col cols="5" sm="2" md="2">
                                C: {{ serie.psfInfo.c }}
                            </v-col>
                            <v-col cols="5" sm="2" md="2">
                                T: {{ serie.swapPsfZT ? serie.psfInfo.z: serie.psfInfo.t }}
                            </v-col>
                                <v-switch
                                v-model="serie.swapPsfZT"
                                label="Swap PSF Z and T dimensions"
                                >
                            </v-switch>
                        </v-row>

                        <v-row>
                            <v-col cols="15" sm="3" md="4">
                                <v-text-field 
                                    v-model="serie.dr"
                                    regular 
                                    label="PSF Lateral spacing(nm/pixel)">
                                </v-text-field>
                            </v-col>
                            <v-col cols="15" sm="3" md="4">
                                <v-text-field 
                                    v-model="serie.dz"
                                    regular 
                                    label="PSF Axial spacing(nm/slice)">
                                </v-text-field>
                            </v-col>
                                <v-switch
                                    v-model="serie.readSpacing"
                                    label="Read spacing from metadata"
                                    >
                                </v-switch>
                        </v-row>
                    </v-col>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
                <v-expansion-panel-header>Deskew</v-expansion-panel-header>
                <v-expansion-panel-content>
                    <v-row>
                        <v-col cols="20" sm="4" md="5">
                            <v-switch
                                v-model="serie.deskew"
                                label="Deskew"
                                >
                            </v-switch>
                        </v-col>
                        <v-col cols="20" sm="4" md="5" v-if="serie.deskew">
                            <v-switch
                                v-model="serie.keepDeskew"
                                label="Keep Deskewed Files"
                                >
                            </v-switch>
                        </v-col>
                    </v-row>
                    <v-row align="center" justify="center" v-if="serie.deskew">  
                        <v-col cols="5" sm="2" md="3">
                            <v-text-field 
                                v-model="serie.angle"
                                regular 
                                type=number
                                label="Angle">
                            </v-text-field>
                        </v-col>
                        <v-col cols="5" sm="3" md="3">
                            <v-text-field 
                                v-model="serie.threshold"
                                regular
                                type=number 
                                label="Backgrond">
                            </v-text-field>
                        </v-col>
                        <v-col cols="15" sm="5" md="6" dense>
                            <v-col cols="15" sm="5" md="6">
                                Median Background: {{serie.median_threshold}}
                            </v-col>
                            <v-col cols="15" sm="5" md="6">
                                Standard deviation: {{serie.stddev}}
                            </v-col>
                        </v-col>
                    </v-row>
                    
                    <v-data-table
                        :headers="deskewMetadataTableHeaders"
                        :items="serie.deskewMetadata"
                        class="elevation-1"
                        hide-default-footer
                        v-if="serie.deskew"
                        >
                            <template v-slot:top>
                                <v-dialog
                                    v-model="deskewEditDialog"
                                    max-width="500px"
                                >
                                    <v-card>
                                        <v-card-title>
                                        <span class="headline">Edit deskew metadata</span>
                                        </v-card-title>

                                        <v-card-text>
                                            <v-container>
                                                <v-row>
                                                <v-col
                                                    cols="12"
                                                    sm="6"
                                                    md="4"
                                                >
                                                    <v-text-field
                                                        v-model="deskewEditedItem.unit"
                                                        label="Unit"
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col
                                                    cols="12"
                                                    sm="6"
                                                    md="4"
                                                >
                                                    <v-text-field
                                                        v-model="deskewEditedItem.pixelWidth"
                                                        label="Pixel Width" type="number"
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col
                                                    cols="12"
                                                    sm="6"
                                                    md="4"
                                                >
                                                        <v-text-field
                                                        v-model="deskewEditedItem.pixelHeight"
                                                        label="Pixel Height" type="number"
                                                    ></v-text-field>
                                                </v-col>
                                                <v-col
                                                    cols="12"
                                                    sm="6"
                                                    md="4"
                                                >
                                                    <v-text-field
                                                        v-model="deskewEditedItem.voxelDepth"
                                                        label="Voxel Depth" type="number"
                                                    ></v-text-field>
                                                </v-col>
                                                </v-row>
                                            </v-container>
                                        </v-card-text>

                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn
                                                color="blue darken-1"
                                                text
                                                @click="closeDeskewDialog"
                                            >
                                                Cancel
                                            </v-btn>
                                            <v-btn
                                                color="blue darken-1"
                                                text
                                                @click="saveDeskewDialog"
                                            >
                                                Save
                                            </v-btn>
                                        </v-card-actions>
                                    </v-card>
                                    </v-dialog>
                            </template>

                            <template v-slot:item.actions="{ item }">
                                <v-icon
                                small
                                class="mr-2"
                                @click="editDeskewItem(item)"
                                >
                                mdi-pencil
                                </v-icon>
                            </template>
                    </v-data-table>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
                <v-expansion-panel-header>Background</v-expansion-panel-header>
                <v-expansion-panel-content>
                    <v-data-table
                        :headers="channelTableHeaders"
                        :items="serie.channels"
                        class="elevation-1"
                        hide-default-footer
                        >
                            <template v-slot:top>
                                <v-dialog
                                    v-model="iterationsEditDialog"
                                    max-width="600px"
                                >
                                    <v-card>
                                        <v-card-title>
                                        <span class="headline">Edit channels</span>
                                        </v-card-title>

                                        <v-card-text>
                                            <v-container>
                                                <v-row>
                                                    <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="4"
                                                    >
                                                        <v-text-field
                                                            v-model="iterationsEditedItem.name"
                                                            label="Channel" disabled
                                                        ></v-text-field>
                                                    </v-col>
                                                    <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="4"
                                                    >
                                                        <v-text-field
                                                            v-model="iterationsEditedItem.iterations"
                                                            label="Iterations" type=number
                                                        ></v-text-field>
                                                    </v-col>
                                                    <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="4"
                                                        v-if="serie.backgroundType.value === -1"
                                                    >
                                                        <v-text-field
                                                            v-model="iterationsEditedItem.background"
                                                            label="Background" type=number
                                                        ></v-text-field>
                                                    </v-col>

                                                    <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="4"
                                                        v-if="serie.psfType !== 3"
                                                    >
                                                        <v-text-field
                                                            v-model="iterationsEditedItem.wavelength"
                                                            label="Emission Wavelength(mm)" type=number
                                                        ></v-text-field>
                                                    </v-col>

                                                    <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="4"
                                                        v-if="serie.psfType === 1"
                                                    >
                                                        <v-text-field
                                                            v-model="iterationsEditedItem.pinhole"
                                                            label="Backprojected pinhole radius(nm)" type=number
                                                        ></v-text-field>
                                                    </v-col>
                                                </v-row>
                                            </v-container>
                                        </v-card-text>

                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn
                                                color="blue darken-1"
                                                text
                                                @click="closeIterationsDialog"
                                            >
                                                Cancel
                                            </v-btn>
                                            <v-btn
                                                color="blue darken-1"
                                                text
                                                @click="saveIterationsDialog"
                                            >
                                                Save
                                            </v-btn>
                                        </v-card-actions>
                                    </v-card>
                                    </v-dialog>
                            </template>

                            <template v-slot:item.actions="{ item }">
                                <v-icon
                                    small
                                    class="mr-2"
                                    @click="editIterationsItem(item)"
                                    >
                                    mdi-pencil
                                </v-icon>
                            </template>

                    </v-data-table>
                    <p />
                    <v-row align="center" justify="center">
                        <v-col cols="20" sm="4" md="5">
                            <v-select
                                :items="backgroundTypes"
                                v-model="serie.backgroundType"
                                item-text="label"
                                item-value="value"
                                label="Background Correction"
                                @change="backgroundTypeChanged"
                                outlined
                                return-object
                                >
                            </v-select>
                        </v-col>

                        <v-col cols="20" sm="4" md="5">
                            <v-text-field 
                                outlined
                                type=number 
                                label="Save every iterations" 
                                v-model="serie.saveEveryIterations"
                            >
                            </v-text-field>
                        </v-col>
                        
                    </v-row>

                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>
            
    </v-form>

</template>

<script>
    import Vue from 'vue';
    import FileBrowserDialog from '../FileBrowserDialog.vue'
    import series from '@/utils/series.js'

    export default {
        name: 'DeconvolutionMain',
        components: {
            FileBrowserDialog,
        },
        props: {
            disabled: Boolean,
            selectedSerie: Object
        },
        data() {
            return {
                panel: [0],
                valid: true,
                serie: series.formatSeries(null),
                rules:{
                    positiveIteration: value => value > 0 || 'Iterations is a positive number',
                    positiveBackground: value => value > 0 || 'Background is a positive number',
                },
                psfModels: [
                    {label: 'Scalar', value: 0},
                    {label: 'Vectorial', value: 1},
                ],
                objectiveRIOptions: [
                    {label: 'Presets', value: -1, disabled: true},
                    {label: 'Air', value: 1},
                    {label: 'Water', value: 1.33},
                    {label: 'Oil, type A', value: 1.515},
                    {label: 'Oil, type F/N', value: 1.518},
                    {label: '80% Glycerol', value: 1.45},
                    {label: 'Silicon', value: 1.41},
                ],
                mediumRIOptions: [
                    {'label': 'Presets', 'value': -1, disabled: true},
                    {'label': 'Water', 'value': 1.33},
                    {'label': 'Vectashield', 'value': 1.46},
                    {'label': 'Prolong Gold', 'value': 1.44},
                    {'label': 'Fluoromount G', 'value': 1.4},
                    {'label': 'Mowiol(low RI)', 'value': 1.41},
                    {'label': 'Mowiol(low RI)', 'value': 1.49},
                    {'label': '80% Glycerol', 'value': 1.45}
                ],
                backgroundTypes: [
                    {'label': 'None', 'value': null},
                    {'label': '1%', 'value': 0.01},
                    {'label': '5%', 'value': 0.05},
                    {'label': '10%', 'value': 0.1},
                    {'label': '25%', 'value': 0.25},
                    {'label': 'Manual', 'value': -1}
                ],
                channelTableHeaders: [
                    {
                        text: 'Channel',
                        align: 'center',
                        sortable: false,
                        value: 'name',
                    },
                    {
                        text: 'Iterations',
                        align: 'center',
                        sortable: false,
                        value: 'iterations',
                    },
                    {
                        text: 'Background',
                        align: ' d-none',
                        sortable: false,
                        value: 'background',
                    },
                    {
                        text: 'Emission Wavelength(mm)',
                        align: ' d-none',
                        sortable: false,
                        value: 'wavelength',
                    },
                    {
                        text: 'Backprojected pinhole radius(nm)',
                        align: ' d-none',
                        sortable: false,
                        value: 'pinhole',
                    },
                    {   text: 'Edit', 
                        value: 'actions', 
                        sortable: false 
                    },
                ],
                deskewMetadataTableHeaders: [
                    {
                        text: 'Unit',
                        align: 'center',
                        sortable: false,
                        value: 'unit',
                    },
                    {
                        text: 'Pixel Width',
                        align: 'center',
                        sortable: false,
                        value: 'pixelWidth',
                    },
                    {
                        text: 'Pixel Height',
                        align: 'center',
                        sortable: false,
                        value: 'pixelHeight',
                    },
                    {
                        text: 'Voxel Depth',
                        align: 'center',
                        sortable: false,
                        value: 'voxelDepth',
                    },
                    {   
                        text: 'Edit', 
                        value: 'actions', 
                        sortable: false 
                    },
                ],
                //deskew edit
                deskewEditDialog: false,
                deskewEditedIndex: -1,
                deskewEditedItem: {
                    unit: '', 
                    pixelWidth: 0, 
                    pixelHeight: 0, 
                    voxelDepth: 0
                },
                // iterations edit
                iterationsEditDialog: false,
                iterationsEditedIndex: -1,
                iterationsEditedItem: {
                    name: 0, 
                    iterations: 0, 
                    background: 0,
                    wavelength: 525,
                    pinhole: 0
                },
            }
        },
        methods: {
            // load the settings from database - or else set to default
            async load(){
                this.$emit("loading", true);
            },
            // change ns from select
            mediumRISelect(){
                if(this.serie.mediumRIOption.value > 0)
                    this.serie.ns = this.serie.mediumRIOption.value;
                else
                    this.serie.mediumRIOption = this.serie.ns
            },
            nsChanged(){
                if( this.serie.ns in Object.values(this.objectiveRIOptions) === false )
                    this.serie.mediumRIOption = -1
            },
            // change RI from select
            objectiveRISelect(){
                if(this.serie.objectiveRIOption.value > 0)
                    this.serie.RI = this.serie.objectiveRIOption.value;
                else
                    this.serie.objectiveRIOption = this.serie.RI
            },
            // RI input
            RIChanged(){
                if( this.serie.RI in Object.values(this.mediumRIOptions) === false )
                    this.serie.objectiveRIOption = -1
            },
            // psf type changed --> called from Deconvolution
            psfTypeChanged(){
                console.log("psf changed")
                console.log(this.serie['psfType'])
                // ligh sheet - wavelength, pinhole hidden - 3-4
                if(this.serie['psfType'] === 3 ){
                    this.channelTableHeaders[3].align = ' d-none';
                    this.channelTableHeaders[4].align = ' d-none';    
                } 
                // confocal wavelength, pinhole shown 
                else if (this.serie['psfType'] === 1 ) {
                    this.channelTableHeaders[3].align = 'center';
                    this.channelTableHeaders[4].align = 'center';    
                }
                // else: pinhole hidden, wavelength shown
                else {
                    this.channelTableHeaders[4].align = ' d-none';
                    this.channelTableHeaders[3].align = 'center';    
                }
            },
            // background correction type changed
            backgroundTypeChanged(){
                if (this.serie.backgroundType.value === -1)
                    this.channelTableHeaders[2].align = 'center';
                else
                    this.channelTableHeaders[2].align = ' d-none'; 
            },
            // edit dekew
            editDeskewItem (item) {
                this.deskewEditedIndex = this.serie.deskewMetadata.indexOf(item)
                this.deskewEditedItem = Object.assign({}, item)
                this.deskewEditDialog = true
            },
            closeDeskewDialog(){
                this.deskewEditDialog = false
                this.$nextTick(() => {
                    this.deskewEditedItem = {}
                    this.deskewEditedIndex = -1
                })
            },
            saveDeskewDialog(){
                if (this.deskewEditedIndex > -1) {
                    Object.assign(this.serie.deskewMetadata[this.deskewEditedIndex], this.deskewEditedItem)
                }
                this.closeDeskewDialog()
            }, 
            // edit dekew
            editIterationsItem (item) {
                this.iterationsEditedIndex = this.serie.channels.indexOf(item)
                this.iterationsEditedItem = Object.assign({}, item)
                this.iterationsEditDialog = true
            },
            closeIterationsDialog(){
                this.iterationsEditDialog = false
                this.$nextTick(() => {
                    this.iterationsEditedItem = {}
                    this.iterationsEditedIndex = -1
                })
            },
            saveIterationsDialog(){
                if (this.iterationsEditedIndex > -1) {
                    Object.assign(this.serie.channels[this.iterationsEditedIndex], this.iterationsEditedItem)
                }
                this.closeIterationsDialog()
            }, 
            async choosePsfFile(){
                let options = await this.$refs.filedialog.open('selectfile', 'Deconvolution', '/');
                if (!options.cancelled && options.path) {
                    if(options.selectedItems.length >0){
                        this.serie.psfFile = options.selectedItems[0].path
                        // TODO: load psffile
                    }
                }
            },
            // return the data
            get_series_modified(){
                return this.serie
            },
            load_new_series(serie){
                Vue.$log.info('Loading ...');
                Vue.$log.info(serie);
                this.serie = serie
                this.psfTypeChanged()
            }

        },
        watch: {
            // async path() {
            //     // path changed
            //     await this.load();
            // },
        },
        mounted() {
            console.log("mounted")
            console.log(this.serie)
        },
  }
</script>

<style lang="scss" scoped>
</style>