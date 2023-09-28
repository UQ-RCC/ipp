<template>
    <v-card :disabled="readonly">
        <PsCalculatorDialog ref="calculatordialog" />
        <SdcCalculatorDialog ref="spdcalculatordialog" />
       
        <v-data-table
            :headers="channelTableHeaders"
            :items="serie.channels"
            class="elevation-1"
            hide-default-footer
            >

            <template v-slot:header.pinhole="{ header}" v-if="showCalc==false" >
                {{ header.text }}<v-icon
                    small
                    class="mr-2"
                    @click="spdcalculator(serie.channels)"
                    >
                    mdi-calculator
                </v-icon> 
            </template>
           

            <template v-slot:item.iterations="props">
                <v-edit-dialog
                :return-value.sync="props.item.iterations"
                >
                {{ props.item.iterations }}
                <template v-slot:input>
                    <v-text-field
                    v-model="props.item.iterations"
                    label="Edit"
                    single-line
                    :rules="[rules.positiveNumber]"
                    @change="valueChange(props.item)" ></v-text-field>
                </template>
                </v-edit-dialog>
                
            </template>

            <template v-slot:item.background="props">
                <v-edit-dialog
                :return-value.sync="props.item.background"
                >
                {{ props.item.background }}
                <template v-slot:input>
                    <v-text-field
                    v-model="props.item.background"
                    label="Edit"
                    single-line
                    @change="valueChange(props.item)"></v-text-field>
                </template>
                </v-edit-dialog>
            </template>

            <template v-slot:item.wavelength="props">
                <v-edit-dialog
                :return-value.sync="props.item.wavelength"
                >
                {{ props.item.wavelength }}                    
                <template v-slot:input>
                    <v-text-field
                    v-model="props.item.wavelength"
                    label="Edit"
                    single-line
                    @change="valueChange(props.item)"></v-text-field>
                </template>
                </v-edit-dialog>
            </template>


            <template v-slot:item.pinhole="props" :rules="[rules.required]">
                {{ props.item.pinhole }}
                <v-icon
                    small
                    class="mr-2"
                    @click="lsmcalculator(props.item)"
                    v-if="showCalc">
                    mdi-calculator
                </v-icon>
            </template> 

            <template v-slot:item.pinholeSpacing="props" :rules="[rules.required]">
                {{ props.item.pinholeSpacing ?? 0 }}  
                
            </template>

            


        
        </v-data-table>
        <p />
        <v-row align="center" justify="center" v-if="api=='Microvolution'">
            <v-col cols="20" sm="4" md="5">
                <v-select
                    :items="backgroundTypes"
                    v-model="serie.backgroundType"
                    item-text="label"
                    item-value="value"
                    label="Background Correction"
                    @change="backgroundTypeChanged"
                    outlined dense
                    >
                </v-select>
            </v-col>

            <v-col cols="20" sm="4" md="5">
                <v-text-field 
                    outlined dense
                    disabled
                    type="number"
                    :rules="[rules.positiveInteger]"   
                    label="Save every iterations" 
                    v-model="serie.saveEveryIterations"
                >
                </v-text-field>
            </v-col>
            
        </v-row>
    </v-card>
</template>

<script>
    // import Vue from 'vue';
    import series from "@/utils/series.js";
    import PsCalculatorDialog from '@/components/PsCalculatorDialog.vue';
    import SdcCalculatorDialog from '@/components/SdcCalculatorDialog.vue';
    import PreferenceAPI from "@/api/PreferenceAPI"
   
    
    export default {
        name: 'DeconvolutionIterations',
        components: {
            PsCalculatorDialog,
            SdcCalculatorDialog,
           
        },
        props: {
            readonly: { type: Boolean, default: false }, 
        },
        data() {
            return {
                valid: true,
                serie: series.formatSeries(null),
                showCalc : false,
                // iterations edit
                iterationsEditDialog: false,
                iterationsEditedIndex: -1,
                iterationsEditedItem: {
                    name: 0, 
                    iterations: 0, 
                    background: 0,
                    wavelength: 525,
                    pinhole: 0,
                    pinholeSpacing: 0,
                },

                // background types
                backgroundTypes: [
                    {'label': 'None', 'value': -1},
                    {'label': '1%', 'value': 0.01},
                    {'label': '5%', 'value': 0.05},
                    {'label': '10%', 'value': 0.1},
                    {'label': '25%', 'value': 0.25},
                    {'label': 'Manual', 'value': 0}
                ],

                // channel table
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
                    {
                        text: 'Pinhole spacing (nm)',
                        align: ' d-none',
                        sortable: false,
                        value: 'pinholeSpacing',
                    },


                    // {   text: 'Actions',
                    //     align: 'center', 
                    //     value: 'actions', 
                    //     sortable: false 
                    // },
                ],
                rules: {
                    required : value => value == 0 || "The input is required",
                    positiveNumber: value => value > 0 || 'Must be zero or greater',
                    positiveInteger: value => value && value >= 0 && Number.isInteger(parseFloat(value)) || 'Must be a positive integer',
                   
                },
                api:"",

            }
        },
        methods: {
            // return the data
            get_serie(){
                return this.serie
            },
            async load_serie(serie){
                this.serie = serie
                this.psfTypeChanged()
                let _current_api = await PreferenceAPI.get_api_option()
                this.api=_current_api.apiname
            },

            // psf type changed --> called from load serie
            psfTypeChanged(){
                // ligh sheet - wavelength, pinhole hidden, calculator - 3-4
                if(this.serie['psfType'] === 3 ){
                    this.backgroundTypeChanged()
                    this.channelTableHeaders[3].align = ' d-none';
                    this.channelTableHeaders[4].align = ' d-none';   
                    this.channelTableHeaders[5].align = ' d-none';    
                } 
                // confocal wavelength, pinhole, claculator shown 
                else if (this.serie['psfType'] === 1 || this.serie['psfType'] === 6 ) {
                    this.showCalc = true;
                    this.channelTableHeaders[2].align = ' d-none';
                    this.channelTableHeaders[3].align = 'center';
                    this.channelTableHeaders[4].align = 'center';  
                    this.channelTableHeaders[5].align = ' d-none';  
                }
                //spinning disk-wavelength, pinhole calc and pinhole spacing shown
                else if (this.serie['psfType'] === 4 || this.serie['psfType'] === 7 || this.serie['psfType'] === 8   ) {
                    this.showCalc = false;
                    this.channelTableHeaders[2].align = ' d-none';
                    this.channelTableHeaders[3].align = 'center';
                    this.channelTableHeaders[4].align = 'center';  
                    this.channelTableHeaders[5].align = 'center';
                }
                else {
                    this.channelTableHeaders[2].align = ' d-none';  
                    this.channelTableHeaders[3].align = 'center';
                    this.channelTableHeaders[4].align = ' d-none';
                    this.channelTableHeaders[5].align = ' d-none';
                      
                }
            },

           
            // background correction type changed
            backgroundTypeChanged(){
                if (this.serie.backgroundType === 0) {
                    this.channelTableHeaders[2].align = 'center';
                }else{
                    this.channelTableHeaders[2].align = ' d-none';
                    let channelsList = this.serie.channels
                    console.log(channelsList)
                    let size = channelsList.length
                    for (let i=0; i < size; i++ ) {
                        if (this.serie.backgroundType == -1) {
                            this.serie.channels[i].background = 0
                        } else if (this.serie.backgroundType == 0.01) {
                            this.serie.channels[i].background = 0.01
                        } else if (this.serie.backgroundType == 0.05) {
                            this.serie.channels[i].background = 0.05
                        } else if (this.serie.backgroundType == 0.1) {
                            this.serie.channels[i].background = 0.1
                        } else if (this.serie.backgroundType == 0.25) {
                            this.serie.channels[i].background = 0.25
                        }  
                    }

                }       
                    
            },
            // edit iterations
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
            is_valid(){
                return true
            }, 
           
            async lsmcalculator(item){
                
                let illuminationType = ''
                if (this.serie['psfType'] == 1) {
                    illuminationType = 'confocal'
                } else if (this.serie['psfType'] == 6) {
                    illuminationType = 'RCM'
                }
                console.log(illuminationType)
                this.iterationsEditedIndex = this.serie.channels.indexOf(item)
                this.iterationsEditedItem = Object.assign({}, item)
                console.log(this.iterationsEditedItem)
                let options = await this.$refs.calculatordialog.open(illuminationType)
                if (!options.cancelled  && options.pinholeRadius ) {
                    item = options.pinholeRadius
                    this.serie.channels[this.iterationsEditedIndex].pinhole = options.pinholeRadius
                } 
                else {
                    console.log("cancelled")
                }
            },

            async spdcalculator(channels){
                let illuminationType = ''
                if (this.serie['psfType'] == 4) {
                    illuminationType = 'spinningdisc'
                } else if (this.serie['psfType'] == 7) {
                    illuminationType = 'iSIM'
                } else if (this.serie['psfType'] == 8) {
                    illuminationType = 'SoRa'
                }
                let channelsList = channels
                let size = channelsList.length
                let options = await this.$refs.spdcalculatordialog.open(illuminationType)
                if (!options.cancelled ) {
                    if (options.pinholeRadius && options.pinholeSpacingnm ) {
                        if (size > 1 ) {
                            for (let i=0; i < size; i++) {
                                this.serie.channels[i].pinhole = options.pinholeRadius
                                this.serie.channels[i].pinholeSpacing = options.pinholeSpacingnm
                            }
                        }
                        if (size === 1) {
                            
                            channels[0].pinhole = options.pinholeRadius
                            channels[0].pinholeSpacing = options.pinholeSpacingnm
                            this.serie.channels[0].pinhole = options.pinholeRadius
                            this.serie.channels[0].pinholeSpacing = options.pinholeSpacingnm
                        }

                    }
                }
                else {
                    console.log("cancelled")
                }
            },

            valueChange(item) {
            
                this.iterationsEditedIndex = this.serie.channels.indexOf(item)
                this.iterationsEditedItem = Object.assign({}, item)
                if (item.iterations === "0") {
                    this.iterationsEditedItem.pinhole = 0
                    this.iterationsEditedItem.pinholeSpacing = 0
                    this.iterationsEditedItem.wavelength = 0

                    this.serie.channels[this.iterationsEditedIndex].pinhole = 0
                    this.serie.channels[this.iterationsEditedIndex].pinholeSpacing = 0
                    this.serie.channels[this.iterationsEditedIndex].wavelength = 0

                }
                //this.serie.channels[this.iterationsEditedIndex] = this.iterationsEditedItem
             
            },
            
        },
        mounted: function() {
           this.showCalc = false
           
        }
       

    }
</script>