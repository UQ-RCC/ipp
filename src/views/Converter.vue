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
                        :items="loaded"
                        :headers="selectedFilesTable.headers"
                        :single-select="true"
                        :disable-pagination="true"
                        item-key="series.path"
                        show-select
                        class="elevation-1"
                        height="200px" width="100%"
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
                    </div>
                </div>
            </v-col>
            <v-divider vertical></v-divider>
            <v-col class="d-flex">
                <v-row align="center" justify="center">    
                    <v-col cols="40" sm="7" md="9">
                        <v-col cols="40" sm="7" md="9">
                            <v-text-field
                                label="Output Base Path"
                                hide-details="auto"
                                v-model="outputBasePath"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="10" sm="3" md="5">
                            <v-text-field
                                label="Output Folder Name"
                                hide-details="auto"
                                v-model="outputFolderName"
                            ></v-text-field>
                        </v-col>
                    </v-col>
                    <v-row align="center" justify="center">
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
                </v-row>
            </v-col>
        </v-row>
        
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
                <span>Submit all the files/series for conversion</span>
            </v-tooltip>
        </v-row>
    </div>
</template>

<script>
    // import * as api from '@/api'
    import Vue from 'vue'
    // import * as api from '@/api'
    import FileBrowserDialog from '@/components/FileBrowserDialog.vue'

    export default {
        name: 'Converter',
        components: {
            FileBrowserDialog,
        },
        data() {
            var data = {
                loading: false,
                selectedFilesTable: {
                    headers: [
                        { text: 'Name', value: 'series.path' }
                    ],
                },
                selected: [],
                loaded: [],
                outputBasePath: "",
                outputFolderName: "",
            }
            return data
        },
        mounted: function() {
        },
        methods: {
            async chooseOutputFolder(){
                let options = await this.$refs.filedialog.open('selectfolder', 'Deconvolution', '/');
                if (!options.cancelled && options.path) {
                    var selectedFolder = options.path
                    Vue.$log.debug("selected folder:" + selectedFolder)
                    if(selectedFolder.endsWith('/'))
                        selectedFolder = selectedFolder.slice(0, -1);
                    var _pathParts = selectedFolder.split("/");
                    this.outputBasePath = _pathParts.slice(0,-1).join("/")
                    this.outputFolderName = _pathParts.slice(-1)[0]
                }
            },

            async submit(){

            }
        }
    }
</script>