<template>
    <v-card>
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
    </v-card>
</template>


<script>
    // import Vue from 'vue';
    import series from "@/utils/series.js";

    export default {
        name: 'DeconvolutionDeskew',
        data() {
            return {
                valid: true,
                serie: series.formatSeries(null),
                //deskew edit
                deskewEditDialog: false,
                deskewEditedIndex: -1,
                deskewEditedItem: {
                    unit: '', 
                    pixelWidth: 0, 
                    pixelHeight: 0, 
                    voxelDepth: 0
                },
                //deskew metadata
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

            }
        },
        methods: {
            // return the data
            get_serie(){
                return this.serie
            },
            load_serie(serie){
                this.serie = serie
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
        }
    }
</script>
