<template>
    <v-toolbar flat dense color="blue-grey lighten-5">
        <file-browser-dialog ref="filedialog" />

        <v-toolbar-items>

            <v-menu offset-y>
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
                    <v-list-item @click="changePath('/afm01/Q0/Q0703/')">
                        <v-list-item-icon>
                            <v-icon>mdi-folder</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>/afm01/Q0/Q0703/</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="changePath('/scratch/eait/uqhngu36/test/nick-test2/')">
                        <v-list-item-icon>
                            <v-icon>mdi-folder</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>/scratch/eait/uqhngu36/test/nick-test2/</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="changePath('/afm02/Q0/')">
                        <v-list-item-icon>
                            <v-icon>mdi-folder</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>/afm02/Q0/</v-list-item-title>
                    </v-list-item>
                </v-list>                
            </v-menu>

            <v-btn text :input-value="path === '/'" @click="changePath('/')">
                /
            </v-btn>
            <template v-for="(segment, index) in pathSegments">
                <v-icon :key="index + '-icon'">mdi-chevron-right</v-icon>
                <v-btn
                    text
                    :input-value="index === pathSegments.length - 1"
                    :key="index + '-btn'"
                    @click="changePath(segment.path)"
                >{{ segment.name }}</v-btn>
            </template>
        </v-toolbar-items>
        <div class="flex-grow-1"></div>

        <template v-if="$vuetify.breakpoint.smAndUp">
            <v-tooltip bottom v-if="pathSegments.length > 0">
                <template v-slot:activator="{ on }">
                    <v-btn icon @click="goUp" v-on="on">
                        <v-icon>mdi-arrow-up-bold-outline</v-icon>
                    </v-btn>
                </template>
                <span v-if="pathSegments.length === 1">Up to "root"</span>
                <span v-else>Up to "{{pathSegments[pathSegments.length - 2].name}}"</span>
            </v-tooltip>            

            <v-btn icon title="Copy Folder" v-if="parentComponent.toLowerCase() == 'filesmanager'" @click="copyFolder('selectfolders')">
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
                        <v-text-field label="Name" v-model="newFolderName" hide-details></v-text-field>
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
                <v-btn icon title="Add to bookmark">
                    <v-icon>mdi-bookmark-plus</v-icon>
                </v-btn>
            </template>


            <template>
                <v-btn icon title="Copy path to clipboard" @click="copyUrl">
                    <v-icon>mdi-content-copy</v-icon>
                </v-btn>
            </template>

        </template>
    </v-toolbar>
</template>

<script>
import FilesAPI from "@/api/FilesAPI";
import Vue from 'vue';

export default {
    name: 'Toolbar',
    components: {
        FileBrowserDialog: () => import('../FileBrowserDialog.vue')
    },
    props: {
        path: String,
        parentComponent: String,
        mode: String
    },
    data() {
        return {
            newFolderPopper: false,
            copyFolderPopper: false,
            newFolderName: ""
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
        },
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
                text: 'Text successfully copied to clipboard!'
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
            if (this.path) {
                this.$emit("loading", true);
                await FilesAPI.mkdir(this.path);
                this.$emit("folder-created", this.newFolderName);
                this.newFolderPopper = false;
                this.newFolderName = "";
                this.$emit("loading", false);
            }
            else{
                return;
            }

        },
        async copyFolder(mode){
            let options = await this.$refs.filedialog.open(mode, 'FilesManager', this.path);
            if (!options.cancelled) {
                console.log("...........");
                console.log(options.path);
                //TODO: copy here
            }
        }

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