<template>
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
</template>

<script>
import FilesAPI from "@/api/FilesAPI";
import Vue from 'vue';

export default {
    name: 'Tree',
    props: {
        icons: Object,
        path: String,
        refreshPending: Boolean,
        parentComponent: String,
        mode: String
    },
    data() {
        return {
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
            console.log("[findItem@Tree] path=" + path)
            let stack = [];
            stack.push(this.items[0]);
            console.log(stack)
            while (stack.length > 0) {
                let node = stack.pop();
                console.log("[findItem@Tree] node= ")
                console.log(node)
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
            console.log("[openPath@Tree] path = " + path)
            console.log("[openPath@Tree] item0 = " + this.items[0])
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
    }
};
</script>

<style lang="scss" scoped>
.folders-tree-card {
    height: 400px;
    width: 350px;
    
    .scroll-x {
        overflow-x: auto;
    }

    .scroll-y {
        overflow-y: auto;
    }

    ::v-deep .folders-tree {
        width: fit-content;
        min-width: 320px;

        .v-treeview-node {
            cursor: pointer;

            &:hover {
                background-color: rgba(0, 0, 0, 0.02);
            }
        }
    }
}
</style>