<template>
    <div>
        <br />
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
                        item-key="series.path"
                        show-select
                        class="elevation-1"
                        height="300px" width="100%"
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

                        <!-- <v-tooltip bottom v-if="selected && selected.length > 0">
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
                        </v-tooltip> -->
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
                                v-model="workingItem.deskew"
                                label="Deskew"
                                >
                            </v-switch>
                            <v-switch
                                v-model="workingItem.keepDeskew"
                                label="Keep Deskewed Files"
                                v-if="workingItem.deskew"
                                >
                            </v-switch>
                        </v-row>
                    </v-col>
                    <v-col v-if="workingItem.deskew" cols="40" sm="9" md="11"> 
                        <v-row> 
                        <v-col cols="5" sm="2" md="3">
                            <v-text-field 
                                v-model="workingItem.angle"
                                regular 
                                type=number
                                :rules="numberRules" 
                                label="Angle">
                            </v-text-field>
                        </v-col>
                        <v-col cols="5" sm="3" md="3">
                            <v-text-field 
                                v-model="workingItem.threshold"
                                regular
                                type=number
                                :rules="numberRules" 
                                label="Background">
                            </v-text-field>
                        </v-col>
                        <v-col cols="15" sm="5" md="6" dense>
                                Median Background: {{workingItem.background}}
                                <p />
                                Standard deviation: {{workingItem.stddev}}
                        </v-col>
                        </v-row>
                    </v-col>
                    <v-col cols="40" sm="9" md="11">
                        <v-data-table
                            :headers="deskewMetadataTableHeaders"
                            :items="[{unit: workingItem.unit, pixelWidth: workingItem.pixelWidth, pixelHeight: workingItem.pixelHeight, pixelDepth: workingItem.pixelDepth }]"
                            class="elevation-1"
                            hide-default-footer
                            v-if="workingItem.deskew"
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
                                                            v-model="workingItem.unit"
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
                                                            v-model="workingItem.pixelWidth"
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
                                                            v-model="workingItem.pixelHeight"
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
                                                            v-model="workingItem.pixelDepth"
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
                            v-model="workingItem.centerAndAverage"
                            label="Centre & Average"
                            @change="centerChanged"
                            >
                        </v-switch>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>

        <v-col>
            <v-row align="center" justify="center">   
                 <v-switch
                    v-model="preprocessing.combine"
                    @change="combineChanged"
                    label="Combine"
                    hint="The order in the table will be the order in the combined stack"
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
                    <span>Submit all the files/series for PSF</span>
                </v-tooltip>
            </v-row>
        </v-col>
    </div>
</template>

<script>
    import Vue from 'vue'
    import FileBrowserDialog from '@/components/FileBrowserDialog.vue'
    import PreferenceAPI from "@/api/PreferenceAPI"
    import series from '@/utils/series.js'
    import DeconvolutionAPI from "@/api/DeconvolutionAPI.js"
    import PreprocessAPI from "@/api/PreprocessAPI.js"

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
                        { text: 'Name', value: 'series.path' }
                    ],
                },
                selected: [],
                loaded: [],
                workingItem: {
                    deskew: true, 
                },
                preprocessing: {
                    combine: true,
                    outputPath: ""
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
                emailNeeded: true
            }
            return data
        },
        methods: {

            // edit dekew
            editDeskewItem () {
                this.deskewEditDialog = true
            },
            saveDeskewDialog(){
                this.deskewEditDialog = false
            },
            
            // move selected item up
            async moveUp(){
                this.selected.forEach(async(item) => {
                    for(let i = 0; i < this.loaded.length; i++){
                        if(this.loaded[i].path === item.path){
                            if (i == 0)
                                return
                            var currentItem = Object.assign({}, this.loaded[i])
                            var previousItem = Object.assign({}, this.loaded[i-1])
                            // change order
                            let currentItemOrder = currentItem.order
                            currentItem.order = previousItem.order
                            previousItem.order = currentItemOrder
                            try {
                                // update psetting
                                await PreferenceAPI.save_psetting(currentItem)
                                await PreferenceAPI.save_psetting(previousItem)
                                this.loaded.splice(i, 1)
                                this.loaded.splice(i-1, 1)
                                this.loaded.splice(i-1, 0, previousItem)
                                this.loaded.splice(i-1, 0, currentItem)
                                this.selected = [this.loaded[i-1]]
                            }
                            catch(err) {
                                Vue.$log.error(err)
                            }// end catch
                            break
                        }
                    }
                })
                this.saveToDb()
            }, 
            // move selceted item down
            async moveDown(){
                this.selected.forEach(async(item) => {
                    for(let i = 0; i < this.loaded.length; i++){
                        if(this.loaded[i].path === item.path){
                            if (i == this.loaded.length-1)
                                return
                            var currentItem = Object.assign({}, this.loaded[i])
                            var nextItem = Object.assign({}, this.loaded[i+1])
                            // change order
                            let currentItemOrder = currentItem.order
                            currentItem.order = nextItem.order
                            nextItem.order = currentItemOrder
                            try {
                                // update psetting
                                await PreferenceAPI.save_psetting(currentItem)
                                await PreferenceAPI.save_psetting(nextItem)
                                this.loaded.splice(i+1, 1)
                                this.loaded.splice(i, 1)
                                this.loaded.splice(i, 0, currentItem)
                                this.loaded.splice(i, 0, nextItem)
                                this.selected = [this.loaded[i+1]]
                            }
                            catch(err) {
                                Vue.$log.error(err)
                            }// end catch
                            break
                        }
                    }
                })
                this.saveToDb()
            },

            // remove item
            async removeCurrentlySelected(){
                Vue.$log.info("Removing currently seleced item")
                let found = false
                this.selected.forEach(async(item) => {
                    for(let i = 0; i < this.loaded.length; i++){
                        if(this.loaded[i].series.path === item.series.path){
                            found = true
                            // delete psetting
                            try{
                                await PreferenceAPI.delete_psetting(item.id)
                                this.loaded.splice(i, 1)
                            }
                            catch(err) {
                                Vue.$log.error("Problem deleting " + item.id)
                                Vue.$log.error(err)
                            }// end catch
                            break
                        } 
                    }
                })
                if(found){
                    this.selected = []
                    if(this.loaded.length == 0){
                        this.outputFolderName = ""
                        this.outputBasePath = ""
                    }
                    this.saveToDb()
                }
            },
            // remove all
            async removeAll(){
                while(this.loaded.length > 0) {
                    let _item = this.loaded.pop()
                    try{
                        await PreferenceAPI.delete_psetting(_item.id)
                    }
                    catch(err) {
                        Vue.$log.error("Problem deleting " + _item.id)
                        Vue.$log.error(err)
                    }// end catch
                }
                this.selected = []
                this.outputFolderName = ""
                this.outputBasePath = ""
                this.saveToDb()
            },

            // save to db
            async saveToDb() {
                if (this.outputBasePath && !this.outputBasePath.endsWith("/"))
                    this.outputBasePath = this.outputBasePath + "/"
                this.preprocessing.outputPath = this.outputBasePath + this.outputFolderName
                await PreferenceAPI.save_preprocessing(this.preprocessing)
            },

            /****************************************************************************** */
            /** this part loads files/folders  **/
            // this is different from display_decon
            async load_path(pathToBeLoaded, isfolder) {
                let items = []
                try{
                    let _storedSeries = await PreferenceAPI.get_serie(pathToBeLoaded)
                    if ( _storedSeries && _storedSeries.length > 0 ) {
                        Vue.$log.debug("Found serie in database")
                        for(let _index = 0; _index < _storedSeries.length; _index++){
                            let _storedSerie = _storedSeries[_index]
                            let _psetting = await PreferenceAPI.create_psetting(this.preprocessing.id, _storedSerie.id)
                            items.push(_psetting)
                        }
                    } else {
                        Vue.$log.debug("Not found in database")
                        let response = null
                        if (isfolder)
                            response = await DeconvolutionAPI.get_folder_info(pathToBeLoaded)
                        else 
                            response = await DeconvolutionAPI.get_file_info(pathToBeLoaded)
                        
                        Vue.$log.debug("Response :")
                        Vue.$log.debug(response)
                        Vue.$log.debug(JSON.parse(JSON.stringify(response)))
                        // add to database
                        for(let _index = 0; _index < response.commandResult.length; _index++){
                            let _responseItem  = response.commandResult[_index]
                            _responseItem.isfolder = isfolder
                            let _serie = series.fixSeriesUnit(_responseItem)
                            // let _setting = series.formatSeries(_responseItem)
                            try{
                                _serie = await PreferenceAPI.create_serie(_serie)
                                let _psetting = await PreferenceAPI.create_psetting(this.preprocessing.id, _serie.id)
                                items.push(_psetting)
                            }
                            catch(err) {
                                Vue.$log.error(err)
                            }// end catch                                    
                        } // end for
                    } // end not found in db
                    Vue.$log.debug("items :")
                    Vue.$log.debug(items)
                }
                catch(err){
                    Vue.$log.error(err)
                    Vue.notify({
                        group: 'sysnotif',
                        type: 'error',
                        title: 'SelectFiles',
                        text: 'Problem selecting files, try again!' + String(err)
                    })
                }
                return items
            },

            /**
             * a common function; to be called by selectFiles, selectFilesInFolders
             */
            async selectFilesOrFolders(isfolder){
                let options = null
                if (isfolder)
                    options = await this.$refs.filedialog.open('selectfilesinfolder', 'Preprocessing', '/')
                else 
                    options = await this.$refs.filedialog.open('selectfiles', 'Preprocessing', '/')
                if (!options.cancelled) {
                    let paths = []
                    if(isfolder){
                        let _pathToBeLoaded = options.path + options.filter
                        Vue.$log.debug("selecting series:" + _pathToBeLoaded)
                        let _exist = false
                        this.loaded.map(file => {
                            if (file.series.path === _pathToBeLoaded)
                                _exist = true
                        })
                        if (_exist)
                            return
                        paths.push(_pathToBeLoaded)
                    } else {
                        Vue.$log.debug("selecting files:")
                        Vue.$log.debug(options.selectedItems)
                        for(let i = 0; i< options.selectedItems.length; i++){
                            let _exists = false
                            this.loaded.map(file => {
                                if (file.series.path === options.selectedItems[i].path)
                                    _exists = true
                            })
                            if (!_exists)
                                paths.push(options.selectedItems[i].path)
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
                        
                    this.loading = true
                    // now load the paths
                    for(let i =0; i < paths.length; i++){
                        Vue.$log.debug(">>>loading:" + paths[i])
                        let items = await this.load_path(paths[i], isfolder)
                        Vue.$log.debug("Results:")
                        Vue.$log.debug(items)
                        this.loaded = this.loaded.concat(items)
                    }
                    if ((!this.selected || this.selected.length ==0) && this.loaded.length > 0){
                        this.selected = [ this.loaded[0] ]
                    }
                    this.loading = false                    
                }
            },

            /**
             * called when select single files
             */
            async selectFiles(){
                await this.selectFilesOrFolders(false)
            },
            /**
             * select series
             */
            async selectFilesInFolder(){
                await this.selectFilesOrFolders(true)
            },

            async chooseOutputFolder(){
                let options = await this.$refs.filedialog.open('selectfolder', 'Preprocessing', '/')
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

            //anItem looks like this { item: any, value: boolean }
            /**
             * an item is selected
             * copy this item settings to the working one ?
             */
            async selectedChanged(anItem){
                // if selected, load it
                anItem.item.selected = anItem.value
                if (anItem.value){
                    this.selected = [ anItem.item ]
                    this.workingItem = this.selected[0]
                    Vue.$log.info(this.workingItem)
                } else {
                    // save this working item
                    await PreferenceAPI.save_psetting(this.workingItem)
                }
            },


            async submit(){
                await PreferenceAPI.save_psetting(this.workingItem)
                await this.saveToDb()
                if(!this.preprocessing.id)
                    return
                let _job = await PreferenceAPI.get_preprocessing_job(this.preprocessing.id, this.emailNeeded)
                let preprocessingjobinfo = Object.assign({}, this.preprocessing)
                preprocessingjobinfo.jobid = _job.id
                preprocessingjobinfo.files = []
                this.loaded.map(item => {
                    let _newItem = Object.assign({}, item)
                    _newItem.path = _newItem.series.path
                    delete _newItem.series
                    preprocessingjobinfo.files.push(_newItem)
                })
                try{
                    PreprocessAPI.preprocess(preprocessingjobinfo)
                    Vue.notify({
                        group: 'datanotif',
                        type: 'success',
                        title: 'Submission',
                        text: 'Successfully submit preprocessing job',
                        closeOnClick: true,
                        duration: 5000,
                    })
                    this.preprocessing = await PreferenceAPI.create_new_processing()
                }
                catch(err) {
                    Vue.$log.error("-----error submittin-----------")
                    Vue.$log.error(err)
                    await PreferenceAPI.delete_job(_job.id)
                    Vue.notify({
                        group: 'datanotif',
                        type: 'error',
                        title: 'Submission',
                        text: 'Fail to submit preprocessing job, please try again',
                        closeOnClick: true,
                        duration: 10000,
                    })
                    
                }
            },

            // center changed
            async centerChanged(){
                console.log("center changed:" + this.workingItem.centerAndAverage)
                if(this.workingItem.centerAndAverage === false){
                    this.preprocessing.combine = false
                    await this.saveToDb()
                }
                await PreferenceAPI.save_psetting(this.workingItem)
            }, 

            async combineChanged(){
                console.log("combne changed:" + this.preprocessing.combine)
                if(this.preprocessing.combine === true){
                    // make all center and averae true
                    this.loaded.map(file => {
                        file.centerAndAverage = true
                        PreferenceAPI.save_psetting(file)
                    })
                    await this.saveToDb()
                }
            }


        },
        computed: {
            valid_dialog_values(){
                if(this.workingItem.pixelWidth && 
                    this.workingItem.pixelHeight &&
                    this.workingItem.pixelDepth)
                    return true
                else
                    return false
            }
        },
        mounted: async function() {
            // load from db 
            let _preprocessingpage = await PreferenceAPI.get_preprocessingpage()
            this.preprocessing = _preprocessingpage.preprocessing
            if(this.preprocessing.outputPath == null)
                this.preprocessing.outputPath = ""
            // get psettings
            for(let i = 0; i< this.preprocessing.psettings.length; i++){
                this.loaded.push(await PreferenceAPI.get_psetting(this.preprocessing.psettings[i].id))
            }
            // go through dbItems and load it based on order
            // console.log(this.loaded)
            this.loaded = this.loaded.sort((a, b) => {
                console.log (a.order - b.order) 
                return a.order - b.oder
            })
            console.log(this.loaded)
            if(this.loaded.length > 0){
                var _pathParts = []
                if(this.preprocessing.outputPath !== "")
                    _pathParts = this.preprocessing.outputPath.split("/")
                else
                    _pathParts = this.loaded[0].series.path.split("/")
                this.outputBasePath = _pathParts.slice(0,-1).join("/")
                this.outputFolderName = "psf_output"
                this.selected = [this.loaded[0]]
                this.workingItem = this.selected[0]
            } else {
                this.selected = []
                this.workingItem = {}
            }
        }
    }
</script>

