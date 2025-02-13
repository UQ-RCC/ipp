<template>
    <v-toolbar flat dense color="blue-grey lighten-5" width="100%">
        <file-browser-dialog ref="filedialog" />
        <confirm ref="confirm"></confirm>
        <copy-confirm-dialog ref="copyconfirm"></copy-confirm-dialog>
        <desktop-manager-dialog ref="desktopdialog" />

        <v-menu offset-y class="pa-2">
            <template v-slot:activator="{ on: menu, attrs }">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on: tooltip }">
                        <v-btn icon class="recent-select-button mr-3" v-bind="attrs" v-on="{ ...tooltip, ...menu }">
                            <v-icon>mdi-chevron-down</v-icon>
                        </v-btn>
                    </template>
                    <span>Recent paths</span>
                </v-tooltip>
            </template>
            <v-list class="recent-select-list">
                <v-subheader>Recent paths</v-subheader>
                <v-list-item-group color="primary">
                    <v-list-item
                        v-for="lastpath in lastpaths"
                        :key="lastpath"
                        @click="changePath(lastpath)"
                        >
                        <v-list-item-icon>
                            <v-icon>mdi-folder</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title  v-text="lastpath"></v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list-item-group>
            </v-list>                
        </v-menu>


            
        <v-sheet
            max-width="60%"
            color="blue-grey lighten-5"
        >
            <v-slide-group show-arrows center-active>
                <v-slide-item key="/"> 
                    <v-btn text :input-value="path === '/'" @click="changePath('/')">
                        /
                    </v-btn>
                </v-slide-item>
                <template v-for="(segment, index) in pathSegments">
                    <v-slide-item  :key="index + '-btn'" max-width="100%">
                    <v-btn
                        text
                        :input-value="index === pathSegments.length - 1"
                        @click="changePath(segment.path)"
                    >{{ segment.name }} /</v-btn>
                    </v-slide-item>
                </template>
            </v-slide-group>
        </v-sheet>


        <v-row justify="end">
            <v-tooltip bottom v-if="pathSegments.length > 0">
                <template v-slot:activator="{ on }">
                    <v-btn icon @click="goUp" v-on="on">
                        <v-icon>mdi-arrow-up-bold-outline</v-icon>
                    </v-btn>
                </template>
                <span v-if="pathSegments.length === 1">Up to "root"</span>
                <span v-else>Up to "{{pathSegments[pathSegments.length - 2].name}}"</span>
            </v-tooltip>            

            
            <v-btn icon title="Add to bookmark" @click="addBookmark">
                <v-icon>mdi-bookmark-plus</v-icon>
            </v-btn>
        

            <v-btn icon title="Copy path to clipboard" @click="copyUrl">
                <v-icon>mdi-content-copy</v-icon>
            </v-btn>
        
            <v-btn icon title="Copy/move files or folders" v-if="parentComponent.toLowerCase() == 'filesmanager' && selectedItems.length > 0" @click="copyFolder()">
                <v-icon>mdi-folder-move</v-icon>
            </v-btn>

            
            <v-menu
                v-model="newFolderPopper"
                :close-on-content-click="false"
                :nudge-width="200"
                offset-y
            >
                <template v-slot:activator="{ on }">
                    <v-btn icon v-on="on" title="Create Folder">
                        <v-icon>mdi-folder-plus-outline</v-icon>
                    </v-btn>
                </template>

                <v-card>
                    <v-card-text>
                        <v-text-field label="Name" v-model="newFolderName" hide-details :autofocus="true" @keydown.enter="mkdir"></v-text-field>
                    </v-card-text>
                    <v-card-actions>
                        <div class="flex-grow-1"></div>
                        <v-btn @click="newFolderPopper = false" depressed>Cancel</v-btn>
                        <v-btn
                            color="success"
                            :disabled="!newFolderName"
                            depressed
                            @click="mkdir"
                        >Create Folder</v-btn>
                    </v-card-actions>
                </v-card>
            </v-menu> 

            <template>
                <v-btn icon title="Delete" @click="deleteSelectedItems" v-if="selectedItems.length > 0">
                    <v-icon>mdi-delete-outline</v-icon>
                </v-btn>
            </template>

            <v-btn icon title="Display in Virtual Desktop" @click="openVirtualDesktop">
                <v-icon>mdi-remote-desktop</v-icon>
            </v-btn>

        </v-row>
        
    </v-toolbar>
</template>

<script>
import FilesAPI from "@/api/FilesAPI"
import PreferenceAPI from "@/api/PreferenceAPI"
import Vue from 'vue'
import Confirm from "./Confirm.vue"
import FileBrowserDialog from '../FileBrowserDialog.vue'
import CopyConfirmDialog from './CopyConfirmDialog.vue'
import DesktopManagerDialog from '../DesktopManagerDialog.vue'


export default {
    name: 'Toolbar',
    components: {
        Confirm, 
        FileBrowserDialog,
        CopyConfirmDialog,
        DesktopManagerDialog
    },
    props: {
        path: String,
        parentComponent: String,
        prefid: Number,
        mode: String,
        lastpaths: Array
    },
    data() {
        return {
            newFolderPopper: false,
            copyFolderPopper: false,
            newFolderName: "",
            filter: "",
            selectedItems: []
        };
    },
    computed: {
        pathSegments() {
            let path = "/",
                isFolder = this.path[this.path.length - 1] === "/",
                segments = this.path.split("/").filter(item => item);

            segments = segments.map((item, index) => {
                path +=
                    item + (index < segments.length - 1 || isFolder ? "/" : "");
                return {
                    name: item,
                    path
                };
            });

            return segments;
        }
    },
    methods: {
        copyUrl() {
            const el = document.createElement('textarea');  
            el.value = this.path;                                 
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
                text: 'Text copied to clipboard!'
            });
        },
        changePath(path) {
            Vue.$log.info("change path:" + path);
            this.$emit("path-changed", path);
        },
        goUp() {
            let segments = this.pathSegments,
                path =
                    segments.length === 1
                        ? "/"
                        : segments[segments.length - 2].path;
            this.changePath(path);
        },
        async addFiles(event) {
            this.$emit("add-files", event.target.files);
            this.$refs.inputUpload.value = "";
        },
        async mkdir() {
            Vue.$log.info("making path:" + this.path + this.newFolderName);
            if (this.path) {
                this.$emit("loading", true);
                try{
                    await FilesAPI.mkdir(this.path+ this.newFolderName);
                    Vue.notify({
                        group: 'sysnotif',
                        type: 'info',
                        title: 'New folder',
                        text: this.newFolderName + ' created!'
                    });
                    this.$emit("folder-created", this.newFolderName);
                    this.newFolderPopper = false;
                    this.newFolderName = "";
                }
                catch(err){
                    Vue.notify({
                        group: 'sysnotif',
                        type: 'error',
                        title: 'New folder',
                        text: 'Fail to create ' + this.newFolderName + ' .Error:' + String(err)
                    });
                }   
                this.$emit("loading", false);
            }
            else{
                return;
            }
        },
        async copyFolder(){
            let options = await this.$refs.filedialog.open('selectfolder', 'FilesManager', '/')
            if (!options.cancelled) {
                let _copiedItems = []
                this.selectedItems.map( item => {
                    _copiedItems.push(item.path)
                })
                
                let destination = options.path
                let copy = false
                
                if ( options.selectedItems.length > 0 ) {
                    destination = destination + options.selectedItems[0].name
                }
                if(_copiedItems.length > 0) {
                    _copiedItems.forEach((item) => {
                        let lastindex = item.lastIndexOf('/');
                        
                        let directoryPath2 = item.substring(0, (lastindex + 1));
                        
                        if (directoryPath2 === destination ) {
                            /* let dotindex =  item.indexOf('.')
                            let pathtoextenstion = item.substring(0,dotindex)
                            let newpath = pathtoextenstion+"_copy"
                            let extention = item.substring(dotindex)
                            _copiedItems[index] = newpath+extention
                            console.log(_copiedItems[index])  */
                            copy=true
                            //item.replace(/(\.[^.]+)$/, '_copy$1')
                        }
                        
                    })
                }
                //let index = _copiedItems[0].lastIndexOf('/');
                
                Vue.$log.info("Copying " + _copiedItems + " to "+ destination)
                let confirmOptions = await this.$refs.copyconfirm.open(_copiedItems, destination)
                if (!confirmOptions.cancelled) {
                    try{
                        let usermail = Vue.prototype.$keycloak && Vue.prototype.$keycloak.idTokenParsed ? Vue.prototype.$keycloak.idTokenParsed.email  : ''
                        await FilesAPI.copy(usermail, _copiedItems.join(";"), destination, 6, confirmOptions.deleteSource, copy)
                        Vue.notify({
                            group: 'sysnotif',
                            type: 'info',
                            title: 'Batch job copy',
                            text: 'Copying job started!'
                        })
                        // clear the selected
                        this.clearAllselected()
                    }
                    catch(err){
                        Vue.notify({
                            group: 'sysnotif',
                            type: 'error',
                            title: 'Copying',
                            text: 'Problem creating copying jobs:' + String(err)
                        })
                    }
                }        
            }
        },
        async addBookmark() {
            var new_bookmark = { 
                name: this.path.replace(/\/$/, "").split("/").slice(-1)[0],
                path: this.path
            }
            try{
                await PreferenceAPI.add_filexplorer_bookmark(this.parentComponent, this.prefid, new_bookmark);
                Vue.notify({
                    group: 'sysnotif',
                    type: 'info',
                    title: 'Bookmark',
                    text: 'Bookmark added!'
                });
                this.$emit("bookmark-changed");
            }
            catch(err){
                Vue.notify({
                    group: 'sysnotif',
                    type: 'error',
                    title: 'Bookmark',
                    text: 'Problem adding bookmark, try again!' + String(err)
                });
            }
            
        },

        clearAllselected() {
            this.$emit('clear-all-selected')
        },

        async deleteSelectedItems(){
            console.log("@Toolbars selected items@delete")
            console.log(this.selectedItems)

            let _deletedItems = []
            let _deletedMsg = 'The following items are going to be deleted: <ul>'
            this.selectedItems.map( item => {
                _deletedItems.push(item.path)
                _deletedMsg = _deletedMsg + '<li>' + item.path + '</li>'
            })
            _deletedMsg = _deletedMsg + '</ul>'

            let confirmed = await this.$refs.confirm.open("Delete",_deletedMsg)

            if (confirmed) {
                this.$emit("loading", true)
                try{
                    await FilesAPI.delete(_deletedItems.join(';'))
                    this.$emit("file-deleted")
                }
                catch(err){
                    Vue.notify({
                        group: 'sysnotif',
                        type: 'error',
                        title: 'Files deletion',
                        text: 'Problem deleting files/folders. Please try again!'
                    });
                }
                this.$emit("loading", false)
            }
        },
        // to be called from parent
        selectedItemsChanged(items) {
            this.selectedItems = items
        },

        // to be called when filter changed
        filterChanged(filterStr) {
            console.log("filter@toolbar:" + filterStr)
            this.filter = filterStr
        },

        /////////////virtual desktop
        async openVirtualDesktop(){
            let itemsToBeOpen = []
            if ( this.selectedItems && this.selectedItems.length > 0){
                for(let _index =0; _index < this.selectedItems.length; _index++){
                    itemsToBeOpen.push(this.selectedItems[_index].path)
                }
            }
            else if(this.filter.trim() !== '')
                itemsToBeOpen = [this.path + this.filter]
            await FilesAPI.createActionFile()
            
            await this.$refs.desktopdialog.open(itemsToBeOpen)
        }
    },
    mounted() {
    }
};
</script>

<style lang="scss" scoped>
.recent-select-button ::v-deep .v-btn__content {
    flex-wrap: wrap;
    font-size: 11px;

    .v-icon {
        width: 100%;
        font-size: 22px;
    }
}

.recent-select-list .v-list-item--disabled {
    background-color: rgba(0, 0, 0, 0.25);
    color: #fff;

    .v-icon {
        color: #fff;
    }
}
</style>