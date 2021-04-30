<template>
    <v-card flat tile class="d-flex flex-column">
        <confirm ref="confirm"></confirm>
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
                label="glob filter"
                v-model="filter_str"
                class="ml-n1"
                @keydown="regexKeyDown"
            >
                <template v-slot:prepend>
                    <v-tooltip
                        bottom
                    >
                        <template v-slot:activator="{ on }">
                        <v-icon v-on="on" @click="helpGlob">
                            mdi-help-circle-outline
                        </v-icon>
                        </template>
                        Click here to read more about glob!
                    </v-tooltip>
                </template>
            </v-text-field>
            <v-btn icon v-if="false">
                <v-icon>mdi-eye-settings-outline</v-icon>
            </v-btn>
            
            
            <v-tooltip bottom class="ml-n1">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                    icon 
                    @click="filterChanged"
                    v-bind="attrs"
                    v-on="on"
                    >
                    <v-icon>mdi-filter-outline</v-icon>
                    </v-btn>
                </template>
                <span>Update filter</span>
            </v-tooltip>
            

            <v-tooltip bottom class="ml-n1">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                    icon 
                    @click="load"
                    v-bind="attrs"
                    v-on="on"
                    >
                    <v-icon>mdi-refresh</v-icon>
                    </v-btn>
                </template>
                <span>Refresh current path</span>
            </v-tooltip>
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
                        <v-list-item-avatar class="ma-0">
                            <v-icon>mdi-folder-outline</v-icon>
                        </v-list-item-avatar>
                        <v-list-item-content class="py-2">
                            <v-list-item-title v-text="item.basename"></v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-btn icon @click.stop="deleteItem(item)">
                                <v-icon color="grey lighten-1">mdi-delete-outline</v-icon>
                            </v-btn>
                            <v-btn icon v-if="false">
                                <v-icon color="grey lighten-1">mdi-information</v-icon>
                            </v-btn>
                        </v-list-item-action>
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
                        <v-list-item-action v-if="['selectfiles', 'selectfile'].includes(mode)">
                            <v-checkbox @click.stop="selectItem(item)" v-model="item.selected"></v-checkbox>
                        </v-list-item-action>
                        
                        <v-list-item-avatar class="ma-0">
                            <v-icon>{{ icons[item.extension.toLowerCase()] || icons['other'] }}</v-icon>
                        </v-list-item-avatar>

                        <v-list-item-content class="py-2">
                            <v-list-item-title v-text="item.basename"></v-list-item-title>
                            <v-list-item-subtitle>{{ item.size }}</v-list-item-subtitle>
                        </v-list-item-content>

                        <v-list-item-action>
                            <v-btn icon @click.stop="deleteItem(item)">
                                <v-icon color="grey lighten-1">mdi-delete-outline</v-icon>
                            </v-btn>
                            <v-btn icon v-if="false">
                                <v-icon color="grey lighten-1">mdi-information</v-icon>
                            </v-btn>
                        </v-list-item-action>
                    </v-list-item>
                </v-list>
            </v-card>
            <v-row>
                <v-col cols="2" sm="2" md="2">
                    <v-text-field 
                        type="number"  
                        label="Items per page" 
                        v-model="itemsperpage"
                        @change="itemsPerpageChanged">
                    </v-text-field>
                </v-col>
                <v-col cols="20" sm="4" md="5">
                    <v-pagination
                        v-model="pageindex"
                        :length="pagelength"
                        :total-visible="pagevisible"
                        @input="pageIndexChanged"
                    ></v-pagination>

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
import FilesAPI from "@/api/FilesAPI"
import Vue from 'vue'
import * as minimatch from 'minimatch'
import miscs from '@/utils/miscs.js'

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
        Confirm
    },
    data() {
        return {
            items: [],
            filteredItems: [],
            displayItems: [], // items to be displaued
            pageindex: 1,
            pagelength: 6,
            pagevisible: 7,
            itemsperpage: 10,
            selectedItems: [],
            total_files: 0, 
            total_folders: 0, 
            // value in text field
            filter_str: "",
            // value used to filter
            filter: "",
            maxSize: 0 // in bytes
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
        clearSelectedItem(){
            console.log("clearing selected item at list")
            this.items.forEach(item => item.selected=false)
            this.selectedItems = []
            this.maxSize = 0
        },
        changePath(path) {
            this.pageindex = 1
            this.$emit("path-changed", path)
        },
        filterChanged() {
            this.filter = this.filter_str
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
                    this.total_files = 0
                    this.total_folders = 0
                    this.items = response.commandResult.map(responseItem => {
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
                        title: 'Bookmark',
                        text: 'Problem loading files, tryagain: error:' + String(err)
                    });
                }
            } else {
                // TODO: load file
            }
            this.$emit("loading", false);
        },
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
                        title: 'Bookmark',
                        text: 'Problem deleting file:' + String(err)
                    });
                }
                this.$emit("loading", false);
            }
        },
        selectItem(item){
            if (this.mode === 'selectfile'){
                this.selectedItems.forEach(element => element.selected = false);
                this.selectedItems = [];
            }
            this.selectedItems.push(item);
            this.$emit("selected-items-changed", this.selectedItems);
        },
        // select all items
        selectall(){

        },
        regexFilter(){
            return this.filter;
        },
        helpGlob(){
            window.open('https://facelessuser.github.io/wcmatch/glob/', '_blank');
        },
        // call this one to update displayItems
        updateDisplayItems(){
            if(this.filter) {
                this.filteredItems = this.items.filter(
                   item =>  !this.filter || minimatch(item.basename, this.filter, { matchBase: true })
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
            console.log("maxsize:" + this.maxSize + " filteredItem size:" + this.filteredItems.length)
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
            this.pagelength = Math.ceil(this.filteredItems.length / this.itemsperpage)
            console.log(this.pagelength)        
            this.displayItems = this.filteredItems.slice((this.pageindex - 1) * this.itemsperpage, 
                                                this.pageindex * this.itemsperpage)
            console.log(this.displayItems)
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
    mounted() {
        this.filter = "";
        this.filterChanged();
    }
};
</script>

<style lang="scss" scoped>
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