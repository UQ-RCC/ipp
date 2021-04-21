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
                        item-key="path"
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
    //api
    import PreferenceAPI from "@/api/PreferenceAPI"
    import ConvertAPI from "@/api/ConvertAPI.js"

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
                        { text: 'Name', value: 'path'}
                    ],
                },
                selected: [],
                loaded: [],
                outputBasePath: "",
                outputFolderName: "",
                dbinfo: {}
            }
            return data
        },
        mounted: async function() {
            // load from db 
            this.dbinfo = await PreferenceAPI.get_convertpage()
            // convert to data
            this.dbinfo.inputPaths.map(path => {
                this.loaded.push({'path': path})
            })
            this.selected = [ this.loaded[0] ]
            // output path
            var _pathParts = this.dbinfo.outputPath.split("/")
            this.outputBasePath = _pathParts.slice(0,-1).join("/")
            this.outputFolderName = _pathParts.slice(-1)[0]
        },

        methods: {
            async chooseOutputFolder(){
                let options = await this.$refs.filedialog.open('selectfolder', 'Deconvolution', '/')
                if (!options.cancelled && options.path) {
                    var selectedFolder = options.path
                    Vue.$log.debug("selected folder:" + selectedFolder)
                    if(selectedFolder.endsWith('/'))
                        selectedFolder = selectedFolder.slice(0, -1)
                    var _pathParts = selectedFolder.split("/")
                    this.outputBasePath = _pathParts.slice(0,-1).join("/")
                    this.outputFolderName = _pathParts.slice(-1)[0]
                }
            },

            async submit(){
                //save first
                this.saveToDb()
                // then submit
                try{
                    await ConvertAPI.convert(this.dbinfo.inputPaths, this.dbinfo.outputPath, this.dbinfo.method, this.dbinfo.prefix)
                    Vue.notify({
                        group: 'datanotif',
                        type: 'success',
                        title: 'Submission',
                        text: 'Successfully submit converting job',
                        closeOnClick: true,
                        duration: 5000,
                    })
                }
                catch(err) {
                    Vue.$log.error("-----error submittin-----------")
                    Vue.$log.error(err)
                    Vue.notify({
                        group: 'datanotif',
                        type: 'error',
                        title: 'Submission',
                        text: 'Fail to submit converting job, please try again',
                        closeOnClick: true,
                        duration: 10000,
                    })
                    
                }
            },

            // remove item
            async removeCurrentlySelected(){
                Vue.$log.info("Removing currently seleced item")
                this.selected.forEach(item => {
                    for(let i = 0; i < this.loaded.length; i++){
                        if(this.loaded[i].path === item.path){
                            this.loaded.splice(i, 1)
                        }
                    }
                })
                this.selected = []
                if(this.loaded.length == 0){
                    this.outputFolderName = ""
                    this.outputBasePath = ""
                }
                this.saveToDb()
            },
            // remove all
            async removeAll(){
                this.loaded = []
                this.selected = []
                this.outputFolderName = ""
                this.outputBasePath = ""
                this.saveToDb()
            },
            //
            async selectFilesOrFolders(isfolder){
                let options = null
                if (isfolder)
                    options = await this.$refs.filedialog.open('selectfilesinfolder', 'Deconvolution', '/')
                else 
                    options = await this.$refs.filedialog.open('selectfiles', 'Deconvolution', '/')
                if (!options.cancelled) {
                    let paths = []
                    if(isfolder){
                        let _pathToBeLoaded = options.path + options.filter
                        Vue.$log.debug("selecting series:" + _pathToBeLoaded)
                        let _exist = false
                        this.loaded.map(file => {
                            if (file.path === _pathToBeLoaded)
                                _exist = true
                        })
                        if (_exist)
                            return
                        paths.push({'path': _pathToBeLoaded})
                    } else {
                        Vue.$log.debug("selecting files:")
                        Vue.$log.debug(options.selectedItems)
                        for(let i = 0; i< options.selectedItems.length; i++){
                            let _exists = false
                            this.loaded.map(file => {
                                if (file.path === options.selectedItems[i].path)
                                    _exists = true
                            })
                            if (!_exists)
                                paths.push({'path': options.selectedItems[i].path})
                        }
                    }
                    // if paths empty return
                    if(paths.length === 0) {
                        Vue.$log.debug("Paths is empty. Return.")
                        return
                    }
                    else {
                        Vue.$log.debug("Paths is not empty. Start loading.")
                        Vue.$log.debug(paths)
                    }
                    
                    if(this.loaded.length === 0){
                        this.outputFolderName = "tif"
                        this.outputBasePath = paths[0].path.split("/").slice(0,-1).join("/")
                    }
                    this.loaded = this.loaded.concat(paths)
                    if ((!this.selected || this.selected.length ==0) && this.loaded.length > 0){
                        this.selected = [ this.loaded[0] ]
                    }
                }
                this.saveToDb()
            },

            // select files
            async selectFilesInFolder(){
                await this.selectFilesOrFolders(true)
            },

            async selectFiles(){
                await this.selectFilesOrFolders(false)
            },
            // save to db
            async saveToDb(){
                this.dbinfo.inputPaths = []
                this.loaded.map( item => {
                    this.dbinfo.inputPaths.push(item.path)
                })
                if (!this.outputBasePath.endsWith("/"))
                    this.outputBasePath = this.outputBasePath + "/"
                this.dbinfo.outputPath = this.outputBasePath + this.outputFolderName
                await PreferenceAPI.update_convertpage(this.dbinfo)
            }

        }
    }
</script>