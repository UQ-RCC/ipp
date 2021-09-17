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
                    <v-col cols="40" sm="7" md="9">
                        <v-btn 
                            class="mx-1" 
                            color="primary" 
                            @click.stop="chooseOutputFolder"
                            rounded dark large 
                            title="Select where to save the outputs"
                            >
                            Choose Output Folder
                        </v-btn>

                        <v-btn 
                            class="mx-1" 
                            color="primary" 
                            title="Browse output folder in a new Window"
                            @click.stop="openOutputFolder"
                            fab medium
                            :disabled="!outputBasePath && !outputFolderName" 
                        >
                            <v-icon>mdi-open-in-app</v-icon>
                    </v-btn>
                    </v-col>
                    
                </v-row>
            </v-col>
        </v-row>
        
        <v-row align="center" justify="center">
            <v-checkbox
                v-model="emailNeeded"
                label="Email when the job is complete"
            ></v-checkbox>
            <v-divider class="mx-4" vertical></v-divider>
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
    import miscs from '@/utils/miscs.js'

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
                dbinfo: {},
                emailNeeded: true
            }
            return data
        },
        mounted: async function() {
            // load from db
            try{
                let convertpage = await PreferenceAPI.get_convertpage()
                this.dbinfo = convertpage.convert
            }
            catch(err) {
                Vue.$log.error(err)
                this.dbinfo = {}
            }// end catch 
            // convert to data
            this.dbinfo.inputPaths.map(path => {
                this.loaded.push({'path': path})
            })
            this.selected = [ this.loaded[0] ]
            // output path
            if (!this.dbinfo.outputPath)
                this.dbinfo.outputPath = ""
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
                    this.saveToDb()
                }
            },

            async submit(){
                //save first
                this.saveToDb()
                // maxsize of files
                let maxSize = 0
                this.loaded.map( item => {
                    if(item.size > maxSize)
                        maxSize = item.size
                })
                // this is to make sure that if things are alrady loaded
                // maxSize is not 0
                if (maxSize < this.dbinfo.maxsize) {
                    maxSize = this.dbinfo.maxsize
                }
                Vue.$log.info("maxsize is:" + maxSize)
                //create job:
                let _job = await PreferenceAPI.get_convert_job(this.dbinfo.id, this.emailNeeded)
                // then submit
                try{
                    let convertinfo = {
                        files: this.dbinfo.inputPaths,
                        output: this.dbinfo.outputPath,
                        method: this.dbinfo.method,
                        prefix: this.dbinfo.prefix,
                        jobid: _job.id
                    }
                    await ConvertAPI.convert(convertinfo, maxSize)
                    // create a new convert
                    Vue.notify({
                        group: 'datanotif',
                        type: 'success',
                        title: 'Submission',
                        text: 'Successfully submit converting job',
                        closeOnClick: true,
                        duration: 5000,
                    })
                    this.dbinfo = await PreferenceAPI.create_new_convert()
                }
                catch(err) {
                    Vue.$log.error("-----error submittin-----------")
                    Vue.$log.error(err)
                    await PreferenceAPI.delete_job(_job.id)
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
                    this.dbinfo.maxsize = 0
                }
                this.saveToDb()
            },
            // remove all
            async removeAll(){
                this.loaded = []
                this.selected = []
                this.outputFolderName = ""
                this.outputBasePath = ""
                this.dbinfo.maxsize = 0
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
                        Vue.$log.debug("selecting series:" + _pathToBeLoaded + " max size:" + options.maxsize)
                        let _exist = false
                        this.loaded.map(file => {
                            if (file.path === _pathToBeLoaded)
                                _exist = true
                        })
                        if (_exist)
                            return
                        if(options.maxsize * 2.2 > miscs.maxMemSize()){
                            Vue.notify({
                                group: 'sysnotif',
                                type: 'warning',
                                title: 'Unable to add file',
                                text: 'This series require too much memory to run! This series cannot be added'
                            })
                            return
                        }
                        paths.push({'path': _pathToBeLoaded, 'size': options.maxsize})
                        if(options.maxsize > this.dbinfo.maxsize)
                            this.dbinfo.maxsize = options.maxsize
                    } else {
                        Vue.$log.debug("selecting files:")
                        Vue.$log.debug(options.selectedItems)
                        for(let i = 0; i< options.selectedItems.length; i++){
                            let _exists = false
                            this.loaded.map(file => {
                                if (file.path === options.selectedItems[i].path)
                                    _exists = true
                            })
                            if (!_exists) {
                                let itemSize = miscs.convertFormattedStrToBytes(options.selectedItems[i].size)
                                if(itemSize * 2.2 > miscs.maxMemSize()){
                                    Vue.notify({
                                        group: 'sysnotif',
                                        type: 'warning',
                                        title: 'Unable to add file',
                                        text: 'This series require too much memory to run! This series cannot be added'
                                    })
                                    return
                                }
                                if(itemSize > this.dbinfo.maxsize)
                                    this.dbinfo.maxsize = itemSize
                                paths.push({'path': options.selectedItems[i].path, 'size': itemSize})
                            }
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
                        this.outputFolderName = "Converter_Output"
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
                if (this.outputBasePath && !this.outputBasePath.endsWith("/"))
                    this.outputBasePath = this.outputBasePath + "/"
                this.dbinfo.outputPath = this.outputBasePath + this.outputFolderName
                //TODO here
                await PreferenceAPI.update_convert(this.dbinfo.id, this.dbinfo)
            },

            // open folder
            openOutputFolder() {
                if (this.outputBasePath && !this.outputBasePath.endsWith("/"))
                    this.outputBasePath = this.outputBasePath + "/"
                let outputPath = this.outputBasePath + this.outputFolderName
                if ( !outputPath.endsWith("/") )
                    outputPath = outputPath + "/"
                let route = this.$router.resolve({path: '/'})
                let url = route.href + "?component=filesmanager&path=" + outputPath
                Vue.$log.info(url )
                window.open(url, '_blank')
            }

        }
    }
</script>