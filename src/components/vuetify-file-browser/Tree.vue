<template>
    <div>
        <v-tabs v-model="tab" max-width="300px">
            <v-tabs-slider color="black"></v-tabs-slider>
            <v-tab key="navigator"><v-icon title="Navigator">mdi-file-tree</v-icon></v-tab>
            <v-tab key="collections"><v-icon title="Collections">mdi-folder-multiple</v-icon></v-tab>
            <v-tab key="bookmarks"><v-icon title="Bookmarks">mdi-bookmark-multiple</v-icon></v-tab>
        </v-tabs>
        
        <v-tabs-items v-model="tab" max-width="300px">
            <v-tab-item key="navigator">
                <v-card flat tile class="d-flex flex-column folders-tree-card">
                    <div class="scroll-y scroll-x">
                        <v-treeview
                            :open="open"
                            :active="active"
                            :items="items"
                            :search="filter"
                            :load-children="readFolder"
                            v-on:update:active="activeChanged"
                            item-key="path"
                            item-text="basename"
                            dense
                            rounded
                            hoverable
                            activatable
                            transition
                            class="folders-tree"
                        >
                            <template v-slot:prepend="{ item, open }">
                                <v-icon
                                    v-if="item.type === 'dir'"
                                >{{ open ? 'mdi-folder-open-outline' : 'mdi-folder-outline' }}</v-icon>
                                <v-icon v-else>{{ icons[item.extension.toLowerCase()] || icons['other'] }}</v-icon>
                            </template>
                            <template v-slot:label="{ item }">
                                {{item.basename}}
                                <v-btn
                                    icon
                                    v-if="item.type === 'dir'"
                                    @click.stop="readFolder(item)"
                                    class="ml-1"
                                >
                                    <v-icon class="pa-0 mdi-18px" color="grey lighten-1">mdi-refresh</v-icon>
                                </v-btn>
                            </template>
                        </v-treeview>
                    </div>
                </v-card>
            </v-tab-item>
            <v-tab-item key="collections">
                <v-card flat tile class="d-flex flex-column collections-card">
                <v-list>
                    <v-list-item-group color="primary">
                        <v-list-item
                            v-for="collection in collections"
                            :key="collection.name"
                            @click="changePath(collection.path)"
                        >
                        <v-icon color="grey lighten-1">mdi-folder-outline</v-icon>
                            
                            <v-list-item-content>
                                <v-list-item-title  v-text="collection.name"></v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list-item-group>
                </v-list>
                </v-card>
            </v-tab-item>
            <v-tab-item key="bookmarks">
                <v-card flat tile class="d-flex flex-column bookmark-card">
                    <v-list-item-group color="primary">
                        <v-list-item
                            v-for="bookmark in bookmarks"
                            :key="bookmark.name"
                            @click="changePath(bookmark.path)"
                        >
                            <v-tooltip top>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn icon v-bind="attrs" v-on="on">
                                        <v-icon color="grey lighten-1">mdi-folder-outline</v-icon>
                                    </v-btn>
                                </template>
                                <span>{{ bookmark.path }}</span>
                            </v-tooltip>
                            
                            <v-list-item-content>
                                <v-list-item-title  v-text="bookmark.name"></v-list-item-title>
                            </v-list-item-content>

                            <v-btn icon @click="deleteBookmark(bookmark)">
                                <v-icon>mdi-delete-outline</v-icon>
                            </v-btn>
                        </v-list-item>
                    </v-list-item-group>
                </v-card>
            </v-tab-item>
        </v-tabs-items>
    </div>
</template>

<script>
import FilesAPI from "@/api/FilesAPI";
import PreferenceAPI from "@/api/PreferenceAPI";
import CollectionsAPI from "@/api/CollectionsAPI";

import Vue from 'vue';

export default {
    name: 'Tree',
    props: {
        icons: Object,
        path: String,
        refreshPending: Boolean,
        parentComponent: String,
        mode: String,
        prefid: Number,
        bookmarks: Array
    },
    data() {
        return {
            tab: null,
            collections: [],
            open: [],
            active: [],
            items: [],
            filter: ""
        };
    },
    methods: {
        init() {
            // Vue.$log.info('@tree init, path=' + this.path);
            this.open = [];
            this.items = [];
            // set default files tree items (root item) in nextTick.
            // Otherwise this.open isn't cleared properly (due to syncing perhaps)
            setTimeout(() => {
                this.items = [
                    {
                        type: "dir",
                        path: "/",
                        basename: "/",
                        extension: "",
                        name: "/",
                        children: []
                    }
                ];
            }, 0);
            if (this.path !== "") {
                this.$emit("path-changed", "");
            }
        },
        async readFolder(item) {
            this.$emit("loading", true);
            item.children = await this.queryPath(item.path);
            this.$emit("loading", false);
        },
        activeChanged(active) {
            this.active = active;
            let path = "";
            if (active.length) {
                path = active[0];
            }
            if (this.path != path) {
                this.$emit("path-changed", path);
            }
        },
        findItem(path) {
            // console.log("[findItem@Tree] path=" + path)
            let stack = [];
            stack.push(this.items[0]);
            // console.log(stack)
            while (stack.length > 0) {
                let node = stack.pop();
                // console.log("[findItem@Tree] node= ")
                // console.log(node)
                if(!node)
                    break;
                if (node.path == path) {
                    return node;
                } else if (node.children && node.children.length) {
                    for (let i = 0; i < node.children.length; i++) {
                        stack.push(node.children[i]);
                    }
                }
            }
            return null;
        },
        async openPath(path) {
            // console.log("[openPath@Tree] path = " + path)
            // console.log("[openPath@Tree] item0 = " + this.items[0])
            this.$emit("loading", true);
            let pathsegments = path.replace(/^\//, "").replace(/\/$/, "").split("/");
            console.log(pathsegments)
            // now we have pathSegments = ["a", "b", "c"] root folder is ignored
            let stack = [];
            stack.push(this.items[0]);
            if (!this.open.includes('/')) {
                this.open.push('/');
            }
            if(stack.length == 0) {
                stack.push('/')
            }
            while (stack.length > 0 && pathsegments.length > 0) {
                let node = stack.pop();
                // if (!this.open.includes(node.path)) {
                //     console.log("adding: " + node.path)
                //     this.open.push(node.path);
                // }
                if(!node)
                    break;
                if (node.path == path) {
                    return node;
                } else {
                    let found = false;
                    let currentsegment = pathsegments.shift();
                    // first search through children
                    // if found, good
                    // if not, query the API
                    // if still notfound, throw error
                    if (node.children && node.children.length) {
                        for (let i = 0; i < node.children.length; i++) {
                            if (node.children[i].basename == currentsegment) {
                                stack.push(node.children[i]);
                                found = true;
                                if (!this.open.includes(node.children[i].path)) {
                                    this.open.push(node.children[i].path);
                                }
                            }
                        }
                    } 
                    if (!found){
                        // try again
                        // query
                        node.children = await this.queryPath(node.path); 
                        for (let i = 0; i < node.children.length; i++) {
                            if (node.children[i].basename == currentsegment) {
                                stack.push(node.children[i]);
                                found = true;
                                if (!this.open.includes(node.children[i].path)) {
                                    this.open.push(node.children[i].path);
                                }
                            }
                        }
                        if(!found){
                            Vue.$log.error("not found problem>>>>>>>>>>>" + currentsegment)
                            this.$emit("loading", false);
                        }
                    }                    
                } 
            }
            this.$emit("loading", false);
        },
        // query path
        async queryPath(path){
            try{
                let response = await FilesAPI.list(path);
                return response.commandResult.map(responseItem => {
                    responseItem.type = "file";
                    responseItem.basename = responseItem.name;
                    responseItem.extension = "";
                    let _extension = responseItem.name.split(".")[1];
                    if ( _extension)
                        responseItem.extension = _extension;
                    responseItem.path = path + responseItem.name;    
                    // folder or symlink
                    if(['d', 'l'].includes(responseItem.permission.charAt(0))){
                        responseItem.type = "dir";
                        responseItem.children = [];
                        responseItem.path = responseItem.path + "/";
                    }
                    return responseItem;
                });
            }
            catch(err){
                Vue.notify({
                    group: 'sysnotif',
                    type: 'error',
                    title: 'Bookmark',
                    text: 'Problem loading files, tryagain: error:' + String(err)
                });
            }
        },
        async changePath(path){
            Vue.$log.info("change path:" + path);
            this.$emit("path-changed", path);
        },

        async deleteBookmark(item) {
            try{
                await PreferenceAPI.remove_filexplorer_bookmark(this.parentComponent, this.prefid, item.id);
                this.$emit("bookmark-changed");
                Vue.notify({
                    group: 'sysnotif',
                    type: 'info',
                    title: 'Bookmark',
                    text: 'Bookmark deleted'
                });
            }
            catch(err){
                Vue.notify({
                    group: 'sysnotif',
                    type: 'error',
                    title: 'Bookmark',
                    text: 'Problem deleting bookmark, try again!' + String(err)
                });
            }
        }
    },
    watch: {
        storage() {
            this.init();
        },
        async path() {
            let item = this.findItem(this.path);
            if (!item) {
                await this.openPath(this.path);
            }
            
            this.active = [this.path];
        },
        async refreshPending(){
            if (this.refreshPending) {
                let item = this.findItem(this.path);
                await this.readFolder(item);
                this.$emit("refreshed");
            }
        }
    },
    created() {
        this.init();
    },
    async mounted() {
        this.collections = []
        try{
            let _collectionResponse = await CollectionsAPI.list()
            _collectionResponse.commandResult.map(_collectionItem => {
                let _collectionPath = _collectionItem.output
                if(!_collectionPath.endsWith("/")) {
                    _collectionPath = _collectionPath + '/'
                }
                this.collections.push({"name": _collectionPath, "path": _collectionPath})
            })
        }
        catch(err){
            Vue.$log.error(err);
        }
    }
};
</script>

<style lang="scss" scoped>
.folders-tree-card {
    height: 600px;
    max-width: 300px;
    
    .scroll-x {
        overflow-x: auto;
    }

    .scroll-y {
        overflow-y: auto;
    }

    ::v-deep .folders-tree {
        width: fit-content;
        min-width: 280px;

        .v-treeview-node {
            cursor: pointer;

            &:hover {
                background-color: rgba(0, 0, 0, 0.02);
            }
        }
    }
}

.bookmark-card {
    height: 600px;
    max-width: 300px;
    
    .scroll-x {
        overflow-x: auto;
    }
    .scroll-y {
        overflow-y: auto;
    }
}

.collections-card {
    height: 600px;
    max-width: 300px;
    
    .scroll-x {
        overflow-x: auto;
    }
    .scroll-y {
        overflow-y: auto;
    }
}

</style>