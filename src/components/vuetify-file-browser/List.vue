<template>
    <v-card flat tile class="d-flex flex-column">
        <confirm ref="confirm"></confirm>
        <v-toolbar v-if="path && isDir" dense flat class="shrink">
            <v-tooltip bottom class="ml-n1" v-if="mode === 'selectflies'">
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
                label="Regex filter"
                v-model="filter"
                prepend-inner-icon="mdi-filter-outline"
                class="ml-n1"
            ></v-text-field>
            <v-btn icon v-if="false">
                <v-icon>mdi-eye-settings-outline</v-icon>
            </v-btn>

            <v-btn icon @click="load">
                <v-icon>mdi-refresh</v-icon>
            </v-btn>
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
        <v-card-text v-else-if="dirs.length || files.length" class="grow">
            <v-list subheader v-if="dirs.length">
                <v-subheader>
                    <v-row>
                        <v-col>
                            Folders
                        </v-col>
                        <v-col>
                            <h4 align="right">
                            {{ dirs.length }} folders
                            </h4>
                        </v-col>
                    </v-row>
                </v-subheader>
                
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
            </v-list>
            <v-divider v-if="dirs.length && files.length"></v-divider>
            <v-list subheader v-if="files.length">
                <v-subheader>
                    <v-row>
                        <v-col>
                            Files
                        </v-col>
                        <v-col>
                            <h4 align="right">
                            {{ files.length }} files
                            </h4>
                        </v-col>
                    </v-row>
                </v-subheader>
                <v-list-item
                    v-for="item in files"
                    :key="item.basename"
                    
                    class="pl-0"
                >
                    <v-list-item-action v-if="mode === 'selectflies'">
                        <v-checkbox @click.stop="deleteItem(item)" v-model="item.selected"></v-checkbox>
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
import { formatBytes } from "./util";
import Confirm from "./Confirm.vue";
import FilesAPI from "@/api/FilesAPI";

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
            filter: "",
            filterRegex: RegExp("")
        };
    },
    computed: {
        dirs() {
            return this.items.filter(
                item =>
                    item.type === "dir" && item.basename.match(this.filterRegex)
            );
        },
        files() {
            return this.items.filter(
                item =>
                    item.type === "file" && item.basename.match(this.filterRegex)
            );
        },
        isDir() {
            return this.path[this.path.length - 1] === "/";
        },
        isFile() {
            return !this.isDir;
        }
    },
    methods: {
        formatBytes,
        changePath(path) {
            this.$emit("path-changed", path);
        },
        async load() {
            this.$emit("loading", true);
            if (this.isDir) {
                let response = await FilesAPI.list(this.path);
                this.items = response.commandResult.map(responseItem => {
                    responseItem.type = "file";
                    responseItem.basename = responseItem.name;
                    responseItem.extension = "";
                    let _extension = responseItem.name.split(".")[1];
                    if ( _extension)
                        responseItem.extension = _extension;
                    responseItem.path = this.path + responseItem.name;    
                    // folder or symlink
                    if(['d', 'l'].includes(responseItem.permission.charAt(0))){
                        responseItem.type = "dir";
                        responseItem.children = [];
                        responseItem.path = responseItem.path + "/";
                    }
                    return responseItem;
                });
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
                await FilesAPI.delete(item.path);
                this.$emit("file-deleted");
                this.$emit("loading", false);
            }
        },
        // select all items
        selectall(){

        },
        regexFilter(){
            return this.filter;
        }

    },
    watch: {
        async path() {
            this.items = [];
            await this.load();
            this.filter = "";
        },
        async refreshPending() {
            if (this.refreshPending) {
                await this.load();
                this.$emit("refreshed");
            }
        }, 
        filter(){
            try {
                this.filterRegex = new RegExp(this.filter);
            } catch(e) {
                console.log("---------");
                console.log(e);
                this.filterRegex = null;
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.v-card {
    height: 600px;
    overflow-x: auto;
    overflow-y: auto;
}


</style>