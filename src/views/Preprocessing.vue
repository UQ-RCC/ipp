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
        <v-row>
            <!-- table and buttons-->
            <v-col class="d-flex" cols="12" sm="4">
                <div class="text-center">
                    <v-data-table
                        v-model="selected"
                        :headers="selectedFilesTable.headers"
                        :items="loaded"
                        :single-select="true"
                        :disable-pagination="true"
                        item-key="path"
                        show-select
                        class="elevation-1"
                        height="200px" width="100%"
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

                        <v-tooltip bottom v-if="selected && selected.length > 0">
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn  class="my-3" 
                                        color="primary"
                                        @click.stop="moveUp()"  
                                        fab dark large 
                                        v-bind="attrs" 
                                        v-on="on"
                                        >
                                    <v-icon>mdi-arrow-up-bold</v-icon>
                                </v-btn>
                            </template>
                            <span>Move selected item up</span>
                        </v-tooltip>

                        <v-tooltip bottom v-if="selected && selected.length > 0">
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn  class="my-3" 
                                        color="primary"
                                        @click.stop="moveDown()"  
                                        fab dark large 
                                        v-bind="attrs" 
                                        v-on="on"
                                        >
                                    <v-icon>mdi-arrow-down-bold</v-icon>
                                </v-btn>
                            </template>
                            <span>Move selected item down</span>
                        </v-tooltip>
                    </div>
                </div>
            </v-col>
            <v-divider vertical></v-divider>
            <!-- <v-col class="d-flex" cols="20" sm="5" md="7"> -->
            <v-col class="d-flex">
                <v-row>
                    <v-col cols="30" sm="7" md="9">
                        <v-row>
                            <v-switch
                                v-model="serie.deskew"
                                label="Deskew"
                                >
                            </v-switch>
                            <v-switch
                                v-model="serie.keepDeskew"
                                label="Keep Deskewed Files"
                                v-if="serie.deskew"
                                >
                            </v-switch>
                        </v-row>
                    </v-col>
                    <v-col v-if="serie.deskew" cols="40" sm="9" md="11"> 
                        <v-row> 
                        <v-col cols="5" sm="2" md="3">
                            <v-text-field 
                                v-model="serie.angle"
                                regular 
                                type=number
                                :rules="numberRules" 
                                label="Angle">
                            </v-text-field>
                        </v-col>
                        <v-col cols="5" sm="3" md="3">
                            <v-text-field 
                                v-model="serie.threshold"
                                regular
                                type=number
                                :rules="numberRules" 
                                label="Background">
                            </v-text-field>
                        </v-col>
                        <v-col cols="15" sm="5" md="6" dense>
                                Median Background: {{serie.background}}
                                <p />
                                Standard deviation: {{serie.stddev}}
                        </v-col>
                        </v-row>
                    </v-col>
                    <v-col cols="40" sm="9" md="11">
                        <v-data-table
                            :headers="deskewMetadataTableHeaders"
                            :items="[{unit: serie.unit, pixelWidth: serie.pixelWidth, pixelHeight: serie.pixelHeight, pixelDepth: serie.pixelDepth }]"
                            class="elevation-1"
                            hide-default-footer
                            v-if="serie.deskew"
                            >
                                <template v-slot:top>
                                    <v-dialog 
                                        v-model="deskewEditDialog"
                                        persistent
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
                                                        <v-select
                                                            :items="units"
                                                            v-model="serie.unit"
                                                            label="Unit"
                                                            outlined
                                                            return-object
                                                            >
                                                        </v-select>
                                                    </v-col>
                                                    <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="4"
                                                    >
                                                        <v-text-field
                                                            v-model="serie.pixelWidth"
                                                            label="Pixel Width" type="number"
                                                            :rules="numberRules" 
                                                        ></v-text-field>
                                                    </v-col>
                                                    <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="4"
                                                    >
                                                            <v-text-field
                                                            v-model="serie.pixelHeight"
                                                            label="Pixel Height" type="number"
                                                            :rules="numberRules" 
                                                        ></v-text-field>
                                                    </v-col>
                                                    <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="4"
                                                    >
                                                        <v-text-field
                                                            v-model="serie.pixelDepth"
                                                            label="Voxel Depth" type="number"
                                                            :rules="numberRules" 
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
                                                    :disabled="!valid_dialog_values"
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
                    </v-col>
                    <v-col cols="40" sm="9" md="11">
                        <v-switch
                            v-model="serie.centerAndAverage"
                            label="Centre & Average"
                            >
                        </v-switch>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>

        <v-col>
            <v-row align="center" justify="center">   
                 <v-switch
                    v-model="serie.combine"
                    label="Combine"
                    hint="Change the series order in the table to change the order in combined stack"
                    :persistent-hint="true"
                    >
                </v-switch>
            </v-row>
            <v-row align="center" justify="center">    
                <v-col cols="20" sm="5" md="7">
                    <v-text-field
                        label="Output Base Path"
                        hide-details="auto"
                        v-model="outputBasePath"
                    ></v-text-field>
                </v-col>
                <v-col cols="10" sm="2" md="3">
                    <v-text-field
                        label="Output Folder Name"
                        hide-details="auto"
                        v-model="outputFolderName"
                    ></v-text-field>
                </v-col>
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
            </v-row>
            <br />
            <v-row align="center" justify="center">
                <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn 
                            color="primary" rounded dark large 
                            v-bind="attrs" v-on="on"
                            @click.stop="submit()">
                                Submit
                        </v-btn>
                    </template>
                    <span>Submit all the files/series for PSF</span>
                </v-tooltip>
            </v-row>
        </v-col>
    </div>
</template>

<script>
    import Vue from 'vue'
    import FileBrowserDialog from '@/components/FileBrowserDialog.vue'

    export default {
        name: 'Preprocessing',
        components: {
            FileBrowserDialog,
        },
        data() {
            var data = {
                loading: false,
                selectedFilesTable: {
                    headers: [
                        { text: 'Name', value: 'path' }
                    ],
                },
                selected: [],
                loaded: [ {'path': '/afm01/Q0/Q0703/Nick_output/LifeAct488Rab13JF546timelapse05_-_1_XY1503384030_Z000_T02_C1_decon_t03_ch00.tif'}, 
                          {'path': '/afm01/Q0/Q0703/Nick_output/LifeAct488Rab13JF546timelapse05_-_1_XY1503384030_Z000_T02_C1_decon_t03_ch01.tif'}, 
                          {'path': '/afm01/Q0/Q0703/Nick_output/LifeAct488Rab13JF546timelapse05_-_1_XY1503384030_Z000_T02_C1_decon_t03_ch03.tif'}],
                serie: {
                    deskew: true,
                    keepDeskew: true,
                    angle: 32.8,
                    threshold: 100, 
                    background: 100, 
                    stddev: 2
                },
                outputBasePath: "",
                outputFolderName: "",
                //deskew edit
                deskewEditDialog: false,
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
                        value: 'pixelDepth',
                    },
                    {   
                        text: 'Edit', 
                        value: 'actions', 
                        sortable: false 
                    },
                ],
                units: [ 'nm', 'µm', 'mm', 'inch' ],
                numberRules: [
                    value => value && value >= 0 || 'Must be 0 or a positive number'
                ],
            }
            return data
        },
        methods: {

            //anItem looks like this { item: any, value: boolean }
            /**
             * 
             */
            selectedChanged(anItem){
                Vue.$log.debug(anItem)
            },
            // edit dekew
            editDeskewItem () {
                this.deskewEditDialog = true
            },
            saveDeskewDialog(){
                this.deskewEditDialog = false
            },
        },
        computed: {
            valid_dialog_values(){
                if(this.serie.pixelWidth && 
                    this.serie.pixelHeight &&
                    this.serie.pixelDepth)
                    return true
                else
                    return false
            }
        }
    }
</script>

