<template>
    <v-form
    ref="form"
    v-model="form.valid"
    lazy-validation
    >
        <file-browser-dialog ref="filedialog" />

        <!-- psfType -->
        <v-row align="center">
            <v-select
            :items="psfTypes"
            v-model="form.psfType"
            item-text="label"
            item-value="value"
            label="Illumination Type"
            outlined
            ></v-select>
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
                        v-model="selectedFilesTable.selected"
                        :headers="selectedFilesTable.headers"
                        :items="selectedFilesTable.selectedFiles"
                        :single-select="true"
                        item-key="name"
                        show-select
                        class="elevation-1"
                        height="250px" width="100%"
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
                            <span>Select folders</span>
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
                            <span>Select individual files</span>
                        </v-tooltip>

                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn class="my-3" color="warning" fab dark large v-bind="attrs" v-on="on">
                                    <v-icon>mdi-minus-circle-outline</v-icon>
                                </v-btn>
                            </template>
                            <span>Remove selected</span>
                        </v-tooltip>

                        <v-tooltip bottom>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn class="my-3" color="error" fab dark large v-bind="attrs" v-on="on">
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
                        <v-btn 
                            class="my-1" 
                            color="primary" 
                            @click.stop="chooseOutputFolder"
                            rounded dark large> 
                            Choose Output Folder
                        </v-btn>
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
                <v-tabs centered top>
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
                            <v-card-text>
                                Main tab
                            </v-card-text>
                        </v-card>
                    </v-tab-item>
                    <v-tab-item>
                        <v-card flat>
                            <v-card-text>
                                Noise tab
                            </v-card-text>
                        </v-card>
                    </v-tab-item>
                    <v-tab-item>
                        <v-card flat>
                            <v-card-text>
                                Advanced tab
                            </v-card-text>
                        </v-card>
                    </v-tab-item>
                    <v-tab-item>
                        <v-card flat>
                            <v-card-text>
                                Device tab
                            </v-card-text>
                        </v-card>
                    </v-tab-item>
                </v-tabs>
                
            </v-col>
        </v-row>

    </v-form>    
</template>

<script>
    // import * as api from '@/api'
    import FileBrowserDialog from '../components/FileBrowserDialog.vue'

    export default {
        name: 'Deconvolution',
        components: {
            FileBrowserDialog
        },
        data() {
            return {
                // ---- form specific
                form: {
                    valid: true,
                    psfType: {label: 'Light Sheet', value: 3},

                    //output folder
                    outputBasePath: '',
                    outputFolderName: '',
                    // Separate outputs based on input paths
                    seperateOutputsBasedonInput: false
                },
                fileBrowserDialog: false,
                fileBrowserDialogMode: '',
                
                // -- selected files table
                selectedFilesTable: {
                    selected: [],
                    headers: [
                        { text: 'Name', value: 'name' }
                    ],
                    selectedFiles: [
                        {name: '/home/collection1/path1/*.tiff'},
                        {name: '/home/collection1/path2/*.tiff'},
                        {name: '/home/collection1/path3/*.tiff'},
                        {name: '/home/collection1/path4/*.tiff'},
                        {name: '/home/collection1/path5/*.tiff'}
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
            }
        },
        computed: {
        },
        mounted: function() {
        },
        methods: {
            async chooseOutputFolder(){
                let options = await this.$refs.filedialog.open('selectfolder', 'Deconvolution', '/');
                if (!options.cancelled && options.path) {
                    console.log("...........");
                    console.log(options.path);
                    var selectedFolder = options.path;
                    if(selectedFolder.endsWith('/'))
                        selectedFolder = selectedFolder.slice(0, -1);
                    var _pathParts = selectedFolder.split("/");
                    this.form.outputBasePath = _pathParts.slice(0,-1).join("/");
                    this.form.outputFolderName = _pathParts.slice(-1)[0];
                    console.log(this.form.outputBasePath + "___"+ this.form.outputFolderName)
                }
            },
            async selectFiles(){
                let options = await this.$refs.filedialog.open('selectfiles', 'Deconvolution', '/');
                if (!options.cancelled) {
                    console.log("...........");
                    console.log(options.path);
                }

            },
            async selectFilesInFolder(){
                let options = await this.$refs.filedialog.open('selectfilesinfolder', 'Deconvolution', '/');
                if (!options.cancelled) {
                    console.log("...........");
                    console.log(options.path);
                }
            }
        }
    }
</script>