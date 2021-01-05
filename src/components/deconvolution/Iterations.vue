<template>
    <v-card :disabled="readonly">
        <pinhole-calculator-dialog ref="calculatordialog" />
        <!-- <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
                <v-btn 
                    class="my-3" 
                    color="primary" 
                    @click.stop="calculator"
                    rounded dark large 
                    v-bind="attrs" v-on="on"
                    >
                    Pinhole calculator
                </v-btn>
            </template>
            <span>Backprojectec pinhole calculator</span>
        </v-tooltip> -->

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
                    :rules="numberRules"   
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
                    pinhole: 0
                },

                // background types
                backgroundTypes: [
                    {'label': 'None', 'value': null},
                    {'label': '1%', 'value': 0.01},
                    {'label': '5%', 'value': 0.05},
                    {'label': '10%', 'value': 0.1},
                    {'label': '25%', 'value': 0.25},
                    {'label': 'Manual', 'value': -1}
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
                        text: 'Calculator',
                        align: ' d-none',
                        value: 'actions',
                        sortable: false,
                    },
                    {   text: 'Edit', 
                        value: 'actions', 
                        sortable: false 
                    },
                ],

                numberRules: [
                    value => ( value || value ===0 ) && String(value).match(/^\d+(\.\d+)?$/).length > 0 || 'Must be a positive number'
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
                    this.channelTableHeaders[3].align = ' d-none';
                    this.channelTableHeaders[4].align = ' d-none';
                    this.channelTableHeaders[5].align = ' d-none';    
                } 
                // confocal wavelength, pinhole, claculator shown 
                else if (this.serie['psfType'] === 1 ) {
                    this.channelTableHeaders[3].align = 'center';
                    this.channelTableHeaders[4].align = 'center';
                    this.channelTableHeaders[5].align = 'center';    
                }
                // else: pinhole, calculator hidden, wavelength shown
                else {
                    this.channelTableHeaders[4].align = ' d-none';
                    this.channelTableHeaders[5].align = ' d-none';
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
            async calculator(){
                let options = await this.$refs.calculatordialog.open()
                if (!options.cancelled) {
                    console.log("agree")
                }
                else {
                    console.log("cancelled")
                }
            }
        }
    }
</script>