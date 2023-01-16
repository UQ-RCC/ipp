<template>
    <v-card :disabled="readonly">
        <pinhole-calculator-dialog ref="calculatordialog" />
        
        <v-data-table
            :headers="channelTableHeaders"
            :items="serie.channels"
            class="elevation-1"
            hide-default-footer
            >

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
                    ></v-text-field>
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
                    ></v-text-field>
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
                    ></v-text-field>
                </template>
                </v-edit-dialog>
            </template>

            <template v-slot:item.pinhole="props">
                {{ props.item.pinhole }}
                <v-icon
                    small
                    class="mr-2"
                    @click="calculator(props.item)"
                    >
                    mdi-calculator
                </v-icon>
            </template>

           <!--  <template v-slot:item.pinholeSpacing="props">
                <v-edit-dialog
                :return-value.sync="props.item.pinholeSpacing"
                >
                {{ props.item.pinholeSpacing ?? 0 }}                 
                <template v-slot:input>
                    <v-text-field
                    v-model="props.item.pinholeSpacing"
                    label="Edit"
                    single-line
                    ></v-text-field>
                </template>
                </v-edit-dialog>
            </template> -->

            <template v-slot:item.pinholeSpacing="props">
                {{ props.item.pinholeSpacing ?? 0 }}  
                
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
                    outlined dense
                    >
                </v-select>
            </v-col>

            <v-col cols="20" sm="4" md="5">
                <v-text-field 
                    outlined dense
                    disabled
                    type="number"
                    :rules="positiveInteger"   
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
    import PinholeCalculatorDialog from '@/components/PinholeCalculatorDialog.vue'
    
    export default {
        name: 'DeconvolutionIterations',
        components: {
            PinholeCalculatorDialog,
        },
        props: {
            readonly: { type: Boolean, default: false }, 
        },
        data() {
            return {
                valid: true,
                serie: series.formatSeries(null),
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
                positiveNumber: [
                    value => value > 0 || 'Must be a positive number',
                ],
                positiveInteger: [
                    value => value && value >= 0 && Number.isInteger(parseFloat(value)) || 'Must be a positive integer'
                ], 

            }
        },
        methods: {
            // return the data
            get_serie(){
                return this.serie
            },
            load_serie(serie){
                this.serie = serie
                this.psfTypeChanged()
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
                else if (this.serie['psfType'] === 1 ) {
                    this.channelTableHeaders[2].align = ' d-none';
                    this.channelTableHeaders[3].align = 'center';
                    this.channelTableHeaders[4].align = 'center';  
                    this.channelTableHeaders[5].align = ' d-none';  
                }
                //spinning disk-wavelength, pinhole calc and pinhole spacing shown
                else if (this.serie['psfType'] === 4 ) {
                    this.channelTableHeaders[2].align = ' d-none';
                    this.channelTableHeaders[3].align = 'center';
                    this.channelTableHeaders[4].align = 'center';  
                    this.channelTableHeaders[5].align = 'center';
                }
                // else: pinhole, calculator hidden, wavelength shown
                else {
                    this.channelTableHeaders[2].align = ' d-none';  
                    this.channelTableHeaders[3].align = 'center';
                    this.channelTableHeaders[4].align = ' d-none';
                    this.channelTableHeaders[5].align = ' d-none';
                      
                }
            },
            // background correction type changed
            backgroundTypeChanged(){
                if (this.serie.backgroundType === 0)
                    this.channelTableHeaders[2].align = 'center';
                else
                    this.channelTableHeaders[2].align = ' d-none'; 
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
            async calculator(item){
                this.iterationsEditedIndex = this.serie.channels.indexOf(item)
                this.iterationsEditedItem = Object.assign({}, item)
                let options = await this.$refs.calculatordialog.open()
                if (!options.cancelled ) {
                    if (options.pinholeRadius) { 
                        item = options.pinholeRadius
                        this.serie.channels[this.iterationsEditedIndex].pinhole = options.pinholeRadius
                    }
                    if (options.pinholeSpacingnm) {
                        item = options.pinholeSpacingnm
                        this.serie.channels[this.iterationsEditedIndex].pinholeSpacing = options.pinholeSpacingnm
                    } 
                }
                else {
                    console.log("cancelled")
                }
            }
        }
    }
</script>