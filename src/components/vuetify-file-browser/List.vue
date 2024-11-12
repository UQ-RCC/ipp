<template>
    <v-card flat tile class="d-flex flex-column">
        <v-overlay v-model="overlay">
            <v-row align="center" justify="center"><label >Loading metedata...</label> </v-row>
            <v-row align="center" justify="center"><v-progress-circular
                color="primary"
                indeterminate
                size="64"
            ></v-progress-circular></v-row>
            
        </v-overlay>
        <confirm ref="confirm"></confirm>
        <file-viewer-dialog ref="fileviewer"></file-viewer-dialog>
        <name-modify-dialog ref="namemodify"></name-modify-dialog>
        <v-toolbar v-if="path && isDir" dense flat class="shrink">
            <v-tooltip bottom class="ml-n1" v-if="mode === 'selectfiles'">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                    icon 
                    @click="selectall"
                    v-bind="attrs"
                    v-on="on"
                    >
                    <v-icon>mdi-select-all</v-icon>
                    </v-btn>
                </template>
                <span>Select all files</span>
            </v-tooltip>

            <v-text-field
                solo
                flat
                hide-details
                label="Search"
                v-model="filter_str"
                class="ml-n1"
                @keydown="regexKeyDown"
                prepend-icon="mdi-case-sensitive-alt"
            >
                <template v-slot:prepend>
                    <v-icon
                        medium
                        title = "Case sensitivity"
                        :color="caseSentive? '#49075e': ''"
                        @click="caseChanged"
                    >
                        mdi-case-sensitive-alt
                    </v-icon>
                </template>

                <template v-slot:append>
                    <v-menu offset-y >
                        <template v-slot:activator="{ on, attrs }">
                                <v-btn v-bind="attrs" v-on="{ ...on }" icon title="Change types of filter">
                                    {{ filterType.label }}
                                    <v-icon>mdi-dots-vertical</v-icon>
                                </v-btn>  
                            </template>
                        <v-list>
                            <v-list-item v-for="(item, index) in filterTypes" :key="index" @click="changeFilterType(item)">
                            <v-list-item-title>{{ item.label }}</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </template>
                <template v-slot:append-outer>
                    <v-icon 
                        @click="filterChanged"
                        title="Update filter"
                        >
                        mdi-filter-outline
                    </v-icon>
                    <v-icon
                        title="Refresh current path"
                        @click="load"
                        >
                        mdi-refresh
                    </v-icon>
                    <v-icon 
                        title="Click here to see how filter works"
                        @click="helpGlob">
                        mdi-help-circle-outline
                    </v-icon>
                </template>
            </v-text-field>
            

            
        </v-toolbar>
        <v-divider v-if="path && isDir"></v-divider>
        
        <v-card-text
            v-if="!path"
            class="grow d-flex justify-center align-center grey--text"
        >Select a folder or a file</v-card-text>
        <v-card-text
            v-else-if="isFile"
            class="grow d-flex justify-center align-center"
        >File: {{ path }}</v-card-text>
        <v-card-text v-else-if="total_folders || total_files" class="grow">
            <v-card class="list-card" flat>
                <v-list subheader v-if="dirs.length > 0">
                    <v-subheader>
                        <v-row>
                            <v-col>
                                Folders
                            </v-col>
                            <v-col>
                                <h4 align="right">
                                {{ total_folders }} folders
                                </h4>
                            </v-col>
                        </v-row>
                    </v-subheader>
                    
                    <!-- <v-lazy> -->
                    <v-list-item
                        v-for="item in dirs"
                        :key="item.basename"
                        @click="changePath(item.path)"
                        class="pl-0"
                    >
                        <v-list-item-action>
                            <v-checkbox v-if="['selectfolders', 'selectfolder', 'manage'].includes(mode)" @click.stop="selectItem(item)" v-model="item.selected"></v-checkbox>
                        </v-list-item-action>

                        <v-list-item-avatar class="ma-0">
                            <v-icon>mdi-folder-outline</v-icon>
                        </v-list-item-avatar>
                        
                        <v-list-item-content class="py-2">
                            <v-list-item-title v-text="item.basename"></v-list-item-title>
                        </v-list-item-content>
                        <!-- <v-list-item-action> -->
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <v-btn icon @click.stop="copyItemPathToClipboard(item)" v-on="on">
                                        <v-icon color="lighten-1">mdi-content-copy</v-icon>
                                    </v-btn>
                                </template>
                                <span>Copy folder path to clipboard</span>
                            </v-tooltip>

                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <v-btn icon @click.stop="renameItem(item)" v-on="on">
                                        <v-icon color="lighten-1">mdi-rename-box</v-icon>
                                    </v-btn>
                                </template>
                                <span>Rename</span>
                            </v-tooltip>
                            
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <v-btn icon @click.stop="deleteItem(item)" v-on="on">
                                        <v-icon color="lighten-1">mdi-delete-outline</v-icon>
                                    </v-btn>
                                </template>
                                <span>Remove folder</span>
                            </v-tooltip>
                            
                            <!-- <v-btn icon v-if="false">
                                <v-icon color="grey lighten-1">mdi-information</v-icon>
                            </v-btn> -->
                        <!-- </v-list-item-action> -->
                    </v-list-item>
                    <!-- </v-lazy> -->
                </v-list>
                <v-divider v-if="dirs.length > 0 && total_files"></v-divider>
                <v-list subheader v-if="files.length > 0">
                    <v-subheader>
                        <v-row>
                            <v-col>
                                Files
                            </v-col>
                            <v-col>
                                <h4 align="right">
                                {{ total_files }} files
                                </h4>
                            </v-col>
                        </v-row>
                    </v-subheader>
                    <v-list-item
                        v-for="item in files"
                        :key="item.basename"
                        
                        class="pl-0"
                    >
                        <!-- <v-list-item-action v-if="['selectfiles', 'selectfile'].includes(mode)"> -->
                        <!-- enable this for all modes -->
                        <v-list-item-action v-if="['selectfiles', 'selectfile', 'manage'].includes(mode)">
                            <v-checkbox @click.stop="selectItem(item)" v-model="item.selected"></v-checkbox>
                        </v-list-item-action>
                        
                        <v-list-item-avatar class="ma-0">
                            <v-icon :style ="{color:iconColor(item)}">{{ icons[item.extension.toLowerCase()] || icons['other'] }}</v-icon>
                        </v-list-item-avatar>

                        <v-list-item-content class="py-2">
                            <v-list-item-title v-text="item.basename"></v-list-item-title>
                            <v-list-item-subtitle>{{ item.size }} {{cacheStatus(item)}}</v-list-item-subtitle>
                        </v-list-item-content>

                        <!-- <v-list-item-action> -->
                            
                            <v-tooltip bottom v-if="canView(item)">
                                <template v-slot:activator="{ on }">
                                    <v-btn icon @click.stop="viewItem(item)" v-on="on">
                                        <v-icon color="lighten-1">mdi-eye</v-icon>
                                    </v-btn>
                                </template>
                                <span>View file</span>
                            </v-tooltip>

                            <v-tooltip bottom v-if="canMetadata(item)">
                                <template v-slot:activator="{ on }">
                                    <v-btn icon @click.stop="viewMetadata(item)" v-on="on">
                                        <v-icon >mdi-tag</v-icon>
                                    </v-btn>
                                </template>
                                <span>View Metadata</span>
                            </v-tooltip>

                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <v-btn icon @click.stop="copyItemPathToClipboard(item)" v-on="on">
                                        <v-icon color="lighten-1">mdi-content-copy</v-icon>
                                    </v-btn>
                                </template>
                                <span>Copy file path to clipboard</span>
                            </v-tooltip>

                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <v-btn icon @click.stop="renameItem(item)" v-on="on">
                                        <v-icon color="lighten-1">mdi-rename-box</v-icon>
                                    </v-btn>
                                </template>
                                <span>Rename</span>
                            </v-tooltip>
                            
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <v-btn icon @click.stop="deleteItem(item)" v-on="on">
                                        <v-icon color="lighten-1">mdi-delete-outline</v-icon>
                                    </v-btn>
                                </template>
                                <span>Remove file</span>
                            </v-tooltip>
                            <!-- <v-btn icon v-if="false">
                                <v-icon color="grey lighten-1">mdi-information</v-icon>
                            </v-btn> -->
                        <!-- </v-list-item-action> -->
                    </v-list-item>
                </v-list>
            </v-card>
            <v-row>
                <v-col cols="2" sm="2" md="2">
                    <v-select
                        v-model="itemsPerPageOption"
                        :items="itemsPerPageOptions"
                        @change="itemsPerpageChanged"
                        label="Rows per page"
                    >
                    </v-select>
                </v-col>
                <v-spacer></v-spacer>
                <v-col cols="20" sm="4" md="5">
                    <v-pagination
                        v-model="pageindex"
                        :length="pagelength"
                        :total-visible="pagevisible"
                        @input="pageIndexChanged"
                    ></v-pagination>

                </v-col>
                <v-spacer></v-spacer>
                <v-col cols="2" sm="2" md="2" justify="end">
                        <div class="mt-3" justify="end"> {{ selectedItems.length }} items selected
                        <v-btn icon title="Clear all selected items" @click="clearAllSelected">
                            <v-icon>mdi-notification-clear-all</v-icon>
                        </v-btn>
                        </div>
                </v-col>
            </v-row>
        </v-card-text>
        <v-card-text
            v-else-if="filter"
            class="grow d-flex justify-center align-center grey--text py-5"
        >No files or folders found</v-card-text>
        <v-card-text
            v-else
            class="grow d-flex justify-center align-center grey--text py-5"
        >The folder is empty</v-card-text>
    </v-card>
</template>

<script>
import Confirm from "./Confirm.vue"
import FileViewerDialog from "./FileViewerDialog"
import NameModifyDialog from "./NameModifyDialog"
import FilesAPI from "@/api/FilesAPI"
import Vue from 'vue'
import * as minimatch from 'minimatch'
import miscs from '@/utils/miscs.js'
import ConfigurationAPI from "@/api/ConfigurationAPI.js"
import PreferenceAPI from "@/api/PreferenceAPI"
    

export default {
    name: 'List',
    props: {
        icons: Object,
        path: String,
        refreshPending: Boolean,
        parentComponent: String,
        mode: String
    },
    components: {
        Confirm, 
        FileViewerDialog,
        NameModifyDialog
    },
    data() {
        return {
            items: [],
            filteredItems: [],
            displayItems: [], // items to be displaued
            pageindex: 1,
            pagelength: 6,
            pagevisible: 7,
            itemsperpage: 50,
            itemsPerPageOption: 50,
            itemsPerPageOptions: [20, 50, 100, 200, 500, 'All'],
            selectedItems: [],
            total_files: 0, 
            total_folders: 0, 
            // value in text field
            filter_str: "",
            // value used to filter
            filter: "",
            filterType: {'type':'contains', 'label': 'Contains'},
            filterTypes: [{'type':'prefix', 'label': 'Starts'},
                          {'type':'postfix', 'label': 'Ends'},
                          {'type':'contains', 'label': 'Contains'},
                          {'type':'custom', 'label': 'Custom'}],
            caseSentive: false, 
            maxSize: 0, // in bytes
            selectedtag: null,
            overlay: false
        };
    },
    computed: {
        dirs() {
            return this.displayItems.filter(
                item => item.type === "dir"
            )
        },
        files() {
            return this.displayItems.filter(
                item => item.type === "file"
            )
        },
        isDir() {
            return this.path[this.path.length - 1] === "/"
        },
        isFile() {
            return !this.isDir
        }
    },
    methods: {

        clearAllSelected(){
            this.selectedItems.forEach(item => item.selected=false)
            // this.items.forEach(item => item.selected=false)
            this.selectedItems = []
            this.maxSize = 0
            this.$emit("selected-items-changed", this.selectedItems)
        },
        parse_size(file_size){
            let size = file_size.trim()
            if (size.endsWith("K")){
                size = (size.split("K")[0])*2**10
            }else if (size.endsWith("M")){
                size = (size.split("M")[0])*2**20
            }else if (size.endsWith("G")){
                size = (size.split("G")[0])*2**30
            }else if (size.endsWith("T")){
                size = (size.split("T")[0])*2**40
            }
            
            return size
        },

        iconColor(item){
            let color
            
            if (item.path.startsWith("/QRISdata") ) {
                let blocks = this.parse_size(item.blocks)
                let size = this.parse_size(item.size)
                if (blocks > 0 && blocks < this.parse_size("16K")) {
                    blocks = this.parse_size("16K")
                }
                if(blocks >= size ) { //file on the disk
                    color = "#000"
                }else if (blocks > 0 && blocks < size) { // being recalled
                    color = "#fb8c00"
                }else if (blocks == 0){ //not in cache
                    color = "#db0707e8"
                }
            }else {
                color = "grey"
            }
            return color

        },

        cacheStatus(item) {
            let status
            if(this.iconColor(item) == "#000") {
                status = "(Available)"
            }else if (this.iconColor(item) == "#fb8c00"){
                status = "(Recalling)"
            }else if (this.iconColor(item) == "#db0707e8"){
                status = "(Not cached)"
            }
            return status

        },

        changeFilterType(fType) {
            this.filterType = fType
            this.filterChanged()
        },

        caseChanged(){
            this.caseSentive = !this.caseSentive
            this.filterChanged()
        },

        // clearSelectedItem(){
        //     this.items.forEach(item => item.selected=false)
        //     this.selectedItems = []
        //     this.maxSize = 0
        // },
        changePath(path) {
            this.pageindex = 1
            this.$emit("path-changed", path)
        },
        filterChanged() {
            this.filter = this.filter_str.trim()
            // now add filter    
            if (this.filter != '*' && this.filter != ''){
                if(this.filterType.type == 'prefix')
                    this.filter = this.filter + '*'
                else if (this.filterType.type == 'postfix')
                    this.filter = '*' + this.filter
                else if (this.filterType.type == 'contains')
                    this.filter = '*' + this.filter + '*'
            }
            this.updateDisplayItems()
            this.$emit("filter-changed", this.filter)
        },
        regexKeyDown(event){
            if (event.key === "Enter"){
                this.filterChanged()
            }
        },
        async load() {
            this.$emit("loading", true)
            this.filter_str = ""
            this.filter = ""
            if (this.isDir) {
                try{
                    let response = await FilesAPI.list(this.path)
                    console.log(response)
                    this.total_files = 0
                    this.total_folders = 0
                    this.items = response.commandResult.map(responseItem => {
                        //console.log(responseItem.name)
                        responseItem.type = "file"
                        responseItem.basename = responseItem.name
                        responseItem.extension = ""
                        let _extension = responseItem.name.split(".")[1]
                        if ( _extension)
                            responseItem.extension = _extension
                        responseItem.path = this.path + responseItem.name    
                        // folder or symlink
                        if(['d', 'l'].includes(responseItem.permission.charAt(0))){
                            responseItem.type = "dir"
                            responseItem.children = []
                            responseItem.path = responseItem.path + "/"
                            this.total_folders++
                        }
                        else {
                            this.total_files++
                        }
                        return responseItem
                    })

                    this.updateDisplayItems()
                }
                catch(err){
                    Vue.notify({
                        group: 'sysnotif',
                        type: 'error',
                        title: 'Loading',
                        text: 'Problem loading files, tryagain: error:' + String(err)
                    });
                }
            } else {
                // TODO: load file
            }
            this.$emit("loading", false);
        },
        async copyItemPathToClipboard(item) {
            const el = document.createElement('textarea');  
            el.value = item.path;                                 
            el.setAttribute('readonly', '');                
            el.style.position = 'absolute';                     
            el.style.left = '-9999px';                      
            document.body.appendChild(el);                  
            const selected =  document.getSelection().rangeCount > 0  ? document.getSelection().getRangeAt(0) : false;                                    
            el.select();                                    
            document.execCommand('copy');                   
            document.body.removeChild(el);                  
            if (selected) {                                 
                document.getSelection().removeAllRanges();    
                document.getSelection().addRange(selected);   
            }
            Vue.notify({
                group: 'sysnotif',
                type: 'info',
                title: 'Copied',
                text: 'Path copied to clipboard!'
            });
        },
        async renameItem(item) {
            let options = await this.$refs.namemodify.open(item.name)
            if (!options.cancelled && options.name && options.name !== item.name) {
                let _pathParts = item.path.split('/')
                _pathParts.pop()
                if(item.type =='dir') {
                    _pathParts.pop()
                }
                let _parentPath = _pathParts.join('/')
                try{
                    await FilesAPI.simplemove(item.path, _parentPath + '/' + options.name)
                    this.$emit("item-renamed")
                }
                catch(err){
                    Vue.notify({
                        group: 'sysnotif',
                        type: 'error',
                        title: 'Renaming file/folder',
                        text: 'Problem renaming file:' + item.path + ". Please try again."
                    });
                }
            }
            else {
                console.log("Nthing changed")
            }
        }, 

        // delete item
        async deleteItem(item) {
            let confirmed = await this.$refs.confirm.open(
                "Delete",
                `Are you sure<br>you want to delete this ${
                    item.type === "dir" ? "folder" : "file"
                }?<br><em>${item.basename}</em>`
            );

            if (confirmed) {
                this.$emit("loading", true);
                try{
                    await FilesAPI.delete(item.path);
                    this.$emit("file-deleted");
                }
                catch(err){
                    Vue.notify({
                        group: 'sysnotif',
                        type: 'error',
                        title: 'File deletion',
                        text: 'Problem deleting file:' + String(err)
                    });
                }
                this.$emit("loading", false);
            }
        },
        selectItem(item){
            // only single file is selected
            if (this.mode === 'selectfile' || this.mode === 'selectfolder'){
                this.selectedItems.forEach(element => element.selected = false)
                this.selectedItems = []
                if(item.selected)
                    this.selectedItems.push(item)
            } else {
                let _found = false
                for(let i =0; i < this.selectedItems.length; i++){
                    if(this.selectedItems[i].path === item.path) {
                        _found = true
                        if(!item.selected) {
                            this.selectedItems.splice(i, 1)
                        } 
                    }
                } 
                if(item.selected && !_found)
                    this.selectedItems.push(item)
            }
            if (this.iconColor(item)=="#db0707e8") {
                Vue.notify({
                    group: 'sysnotif',
                    type: 'warn',
                    title: 'File Cache Status',
                    text: 'File is not available in cache, there may be recall delay acessing this file!'
                });
            }else if (this.iconColor(item) == "#fb8c00"){
                Vue.notify({
                    group: 'sysnotif',
                    type: 'warn',
                    title: 'File Cache Status',
                    text: 'File is being recalled!'
                });
            }
            this.$emit("selected-items-changed", this.selectedItems);
        },
        // select all items
        selectall(){

        },
        regexFilter(){
            return this.filter;
        },
        helpGlob(){
            window.open('https://uq-rcc.github.io/ipp-docs/#/guide?id=search-bar', '_blank');
        },
        // call this one to update displayItems
        updateDisplayItems(){
            if(this.filter) {
                this.filteredItems = this.items.filter(
                   item =>  !this.filter || minimatch(item.basename, this.filter, { matchBase: true, nocase: !this.caseSentive })
                )
                this.total_files = 0
                this.total_folders = 0
                this.filteredItems.map(_item => {
                    if(['d', 'l'].includes(_item.permission.charAt(0))){
                        this.total_folders++
                    } else {
                        this.total_files++
                    }
                })
            } else {
                this.filteredItems = this.items
            }
            this.maxSize = 0
            // go through filteredItems to get the biggest file
            this.filteredItems.map(_item => {
                if(!['d', 'l'].includes(_item.permission.charAt(0))){
                    let _itemSize = miscs.convertFormattedStrToBytes(_item.size)
                    if ( _itemSize > this.maxSize) {
                        this.maxSize = _itemSize
                    }
                } 
            })
            
            // emit maxsize changed
            
            this.$emit("maxsize-changed", this.maxSize)
            //calculate total pages
            this.pageindex = 1
            this.pagelength = Math.ceil(this.filteredItems.length / this.itemsperpage)        
            this.displayItems = this.filteredItems.slice((this.pageindex - 1) * this.itemsperpage, 
                                                this.pageindex * this.itemsperpage)
            
        },

        pageIndexChanged(num){
            this.pageindex = num
            this.displayItems = this.filteredItems.slice((this.pageindex - 1) * this.itemsperpage, 
                                                this.pageindex * this.itemsperpage)
        },
        itemsPerpageChanged(){
            // calculate items per page from 
            if (isNaN(this.itemsPerPageOption)) {
                this.itemsperpage = 4294967295
            } else {
                this.itemsperpage = this.itemsPerPageOption
            }
            this.pagelength = Math.ceil(this.filteredItems.length / this.itemsperpage)
                 
            this.displayItems = this.filteredItems.slice((this.pageindex - 1) * this.itemsperpage, 
                                                this.pageindex * this.itemsperpage)
            console.log(this.displayItems)
        },
        canView(item){
            let extension = item.basename.split(".").pop()
            return (item.type === "file" && ["txt", "out", "err", "json", "xml", "pref", "csv","rtx","rtf"].includes(extension) )
        },
        canMetadata(item){
            let extension = item.basename.split(".").pop()
            return (item.type === "file" && ["tif", "tiff", "ome-tiff", "nd2", "czi", "ims", "lif","oib"].includes(extension) )
        },
       
        async viewMetadata(item){
            
            try{
                this.overlay =true
                const response= await ConfigurationAPI.execute_metedata_script(btoa(item.path), this.selectedtag, false, false, false)
                this.overlay =false    
                let output = response.commandResult
                const mdata = output.find(entry => entry.out.startsWith('{"params"'))
                let json_output =  JSON.parse(mdata.out)
                
                if (json_output.results !=null && json_output.results.metadata.length >0){
                    if (json_output.results.success) {
                        await this.$refs.fileviewer.open(
                            item.path,
                            JSON.stringify(json_output.results.metadata, null, 2)
                        )

                    } else if(!json_output.results.success) {
                        await this.$refs.fileviewer.open(
                            item.path,
                            JSON.stringify(json_output.results.msg, null, 2)
                        )

                    }

                }
              
            }
            catch(err){
                Vue.notify({
                    group: 'sysnotif',
                    type: 'error',
                    title: 'View Metadata',
                    text: 'Problem reading metadata:' + String(err)
                })
            } 
        },
        async viewItem(item){
            console.log("reading:" + item.path)
            console.log("reading:" + item.path)
            try{
                let _readFileResponse = await FilesAPI.readTextFile(item.path)
                console.log(_readFileResponse)
                if(_readFileResponse.commandResult.length > 0){
                    await this.$refs.fileviewer.open(
                        item.path,
                        atob(_readFileResponse.commandResult[0].output)
                    )
                }
            }
            catch(err){
                Vue.notify({
                    group: 'sysnotif',
                    type: 'error',
                    title: 'Read file',
                    text: 'Problem reading file:' + String(err)
                })
            }
        }

    },
    watch: {
        async path() {
            this.items = [];
            await this.load();
            this.filter = "";
            this.filterChanged();
        },
        async refreshPending() {
            if (this.refreshPending) {
                await this.load();
                this.$emit("refreshed");
            }
        }, 
    },
    async mounted() {
        this.filter = "";
        this.filterChanged();
        let _current_api = await PreferenceAPI.get_config()
        this.selectedtag = _current_api.metadatatag
        
    }
};
</script>

<style lang="scss" scoped>
.v-input__slot::before {
  border-style: none !important;
}

.v-card {
    height: 650px;
    overflow-x: auto;
    overflow-y: auto;
}

.list-card {
    height: 470px;
    width: 100%;
    
    .scroll-x {
        overflow-x: auto;
    }
    .scroll-y {
        overflow-y: auto;
    }
}


</style>