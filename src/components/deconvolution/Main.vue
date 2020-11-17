<template>
    <v-form
        ref="mainform"
        v-model="valid"
        lazy-validation
        >
    
        <v-expansion-panels
        v-model="panel"
        multiple
        >
            <v-expansion-panel>
                <v-expansion-panel-header>Metadata</v-expansion-panel-header>
                <v-expansion-panel-content>
                        <v-row align="center" justify="center">    
                            <v-col cols="20" sm="4" md="5">
                                <v-text-field regular label="Lateral spacing(nm/pixel)" v-model="main.lateralSpacing">
                                </v-text-field>
                                <v-text-field regular label="Axial spacing(nm/slice)" v-model="main.axialSpacing">
                                </v-text-field>
                            </v-col>
                            <v-row align="center" justify="center">
                                <v-switch
                                    v-model="main.readSpacingFromMetadata"
                                    label="Read spacing from metadata"
                                    >
                                </v-switch>
                            </v-row>
                        </v-row>
                        <v-row>
                            <v-col cols="5" sm="2" md="2">
                                X: {{ main.selectedItem.x }}
                            </v-col>
                            <v-col cols="5" sm="2" md="2">
                                Y: {{ main.selectedItem.y }}
                            </v-col>
                            <v-col cols="5" sm="2" md="2">
                                Z: {{ main.swapZT ? main.selectedItem.t: main.selectedItem.z }}
                            </v-col>
                            <v-col cols="5" sm="2" md="2">
                                C: {{ main.selectedItem.c }} 
                            </v-col>
                            <v-col cols="5" sm="2" md="2">
                                T: {{ main.swapZT ? main.selectedItem.t: main.selectedItem.z }}
                            </v-col>
                        </v-row>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
                <v-expansion-panel-header>PSF</v-expansion-panel-header>
                <v-expansion-panel-content>
                    <v-row align="center" justify="center">
                        <v-switch
                            v-model="main.generatePsf"
                            label="Generate PSF"
                            >
                        </v-switch>
                    </v-row>
                    
                    <v-col v-if="main.generatePsf">
                        <v-row>
                            <v-col cols="15" sm="3" md="4">
                                <v-select
                                    :items="psfModels"
                                    v-model="main.psfModel"
                                    item-text="label"
                                    item-value="value"
                                    label="PSF Model"
                                    outlined
                                    return-object
                                    >
                                </v-select>
                            </v-col>
                            <v-row v-if="main.psfModel.value!==0">
                                <v-col cols="20" sm="4" md="5">
                                    <v-text-field 
                                        v-model="main.ns"
                                        @change="nsChanged"
                                        regular 
                                        label="Sample medium refractive index" 
                                        type="number">
                                    </v-text-field>
                                </v-col>

                                
                                <v-col cols="15" sm="3" md="4">
                                    <v-select
                                        :items="mediumRIOptions"
                                        v-model="main.mediumRIOption"
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
                                <v-text-field regular label="Objective NA" type="number">
                                </v-text-field>
                            </v-col>
                            <v-col cols="15" sm="3" md="4">
                                <v-text-field regular label="Light sheet illumination NA" type="number">
                                </v-text-field>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="15" sm="3" md="4">
                                <v-text-field 
                                    v-model="main.RI"
                                    @change="RIChanged"
                                    regular 
                                    label="Objective immersion refractive index" 
                                    type="number">
                                </v-text-field>
                            </v-col>
                            <v-col cols="15" sm="3" md="4">
                                <v-select
                                    :items="objectiveRIOptions"
                                    v-model="main.objectiveRIOption"
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


                    <v-col v-if="!main.generatePsf">
                        <v-row align="center" justify="center">
                            <v-col cols="30" sm="6" md="7">
                                <v-text-field regular label="PSF file">
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
                                X: 100
                            </v-col>
                            <v-col cols="5" sm="2" md="2">
                                Y: 100
                            </v-col>
                            <v-col cols="5" sm="2" md="2">
                                Z: 1000
                            </v-col>
                            <v-col cols="5" sm="2" md="2">
                                C:1 
                            </v-col>
                            <v-col cols="5" sm="2" md="2">
                                T: 10
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="15" sm="3" md="4">
                                <v-text-field 
                                    v-model="main.lateralSpacing"
                                    regular 
                                    label="PSF Lateral spacing(nm/pixel)">
                                </v-text-field>
                            </v-col>
                            <v-col cols="15" sm="3" md="4">
                                <v-text-field 
                                    v-model="main.axialSpacing"
                                    regular 
                                    label="PSF Axial spacing(nm/slice)">
                                </v-text-field>
                            </v-col>
                                <v-switch
                                    v-model="main.readSpacingFromMetadata"
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
                    <v-row align="center" justify="center">
                        <v-col cols="20" sm="4" md="5">
                            <v-switch
                                v-model="main.deskew"
                                label="Deskew"
                                >
                            </v-switch>
                        </v-col>
                        <v-col cols="20" sm="4" md="5" v-if="main.deskew">
                            <v-switch
                                v-model="main.keepDeskew"
                                label="Keep Deskewed Files"
                                >
                            </v-switch>
                        </v-col>
                    </v-row>
                    <v-row align="center" justify="center">  
                        <v-col cols="5" sm="2" md="3">
                            <v-text-field 
                                v-model="main.deskewAngle"
                                regular 
                                type=number
                                label="Angle">
                            </v-text-field>
                        </v-col>
                        <v-col cols="5" sm="3" md="3">
                            <v-text-field 
                                v-model="main.deskewThreshold"
                                regular
                                type=number 
                                label="Backgrond">
                            </v-text-field>
                        </v-col>
                        <v-col cols="15" sm="5" md="6" dense>
                            <v-col cols="15" sm="5" md="6">
                                Background: 100
                            </v-col>
                            <v-col cols="15" sm="5" md="6">
                                Standard deviation: 100
                            </v-col>
                        </v-col>
                    </v-row>
                    
                    <v-data-table
                        :headers="deskewMetadataTableHeaders"
                        :items="main.deskewMetadata"
                        class="elevation-1"
                        hide-default-footer
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
                        :items="main.channels"
                        class="elevation-1"
                        hide-default-footer
                        >
                            <template v-slot:top>
                                <v-dialog
                                    v-model="iterationsEditDialog"
                                    max-width="500px"
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
                                                        v-if="main.backgroundType.value === -1"
                                                    >
                                                        <v-text-field
                                                            v-model="iterationsEditedItem.background"
                                                            label="Background" type=number
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
                    <v-row>
                        <v-select
                            :items="backgroundTypes"
                            v-model="main.backgroundType"
                            item-text="label"
                            item-value="value"
                            label="Background Correction"
                            @change="backgroundTypeChanged"
                            outlined
                            return-object
                            >
                        </v-select>
                    </v-row>

                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>
            
        
        


    </v-form>

</template>

<script>
    export default {
        name: 'DeconvolutionMain',
        props: {
            // path of the series - can be file, folder
            path: String,
        },
        data() {
            return {
                panel: [0, 1, 2 ,3],
                valid: true,
                main:{
                    generatePsf: true,
                    readSpacing: false,
                    lateralSpacing: 0,
                    axialSpacing:0, 
                    swapZT: false, 
                    selectedItem: {x: 100, y:100, z:1, c:1, t:1},
                    psfModel: {label: 'Scalar', value: 0},
                    RI: 1.33, // Objective immersion RI
                    objectiveRIOption: 1.33,
                    ns: 1.33, // sample medium RI
                    mediumRIOption: 1.33,

                    deskew: true,
                    keepDeskew: false,
                    deskewAngle: 0, 
                    deskewThreshold: 0,
                    deskewMetadata: [
                        { unit: 'µm', pixelWidth: 0.104, pixelHeight: 0.104, voxelDepth: 0.268146 }
                    ],

                    backgroundType: {'label': 'None', 'value': null},
                    channels: [
                        {name: 1, iterations: 10, background: 0}
                    ]
                },
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
                    background: 0
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
                if(this.main.mediumRIOption.value > 0)
                    this.main.ns = this.main.mediumRIOption.value;
                else
                    this.main.mediumRIOption = this.main.ns
            },
            nsChanged(){
                if( this.main.ns in Object.values(this.objectiveRIOptions) === false )
                    this.main.mediumRIOption = -1
            },
            // change RI from select
            objectiveRISelect(){
                if(this.main.objectiveRIOption.value > 0)
                    this.main.RI = this.main.objectiveRIOption.value;
                else
                    this.main.objectiveRIOption = this.main.RI
            },
            // RI input
            RIChanged(){
                if( this.main.RI in Object.values(this.mediumRIOptions) === false )
                    this.main.objectiveRIOption = -1
            },
            // background correction type changed
            backgroundTypeChanged(){
                if (this.main.backgroundType.value === -1)
                    this.channelTableHeaders[2].align = 'center';
                else
                    this.channelTableHeaders[2].align = ' d-none'; 
            },
            // edit dekew
            editDeskewItem (item) {
                this.deskewEditedIndex = this.main.deskewMetadata.indexOf(item)
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
                    Object.assign(this.main.deskewMetadata[this.deskewEditedIndex], this.deskewEditedItem)
                }
                this.closeDeskewDialog()
            }, 
            // edit dekew
            editIterationsItem (item) {
                this.iterationsEditedIndex = this.main.channels.indexOf(item)
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
                    Object.assign(this.main.channels[this.iterationsEditedIndex], this.iterationsEditedItem)
                }
                this.closeIterationsDialog()
            }, 


        },
        watch: {
            async path() {
                // path changed
                await this.load();
            },
        }
  }
</script>

<style lang="scss" scoped>
</style>