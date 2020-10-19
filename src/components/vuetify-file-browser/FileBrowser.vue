<template>
    <v-card  :loading="loading > 0">
        <toolbar
            :path="path"
            :parentComponent="parentComponent"
            :mode="mode"
            v-on:path-changed="pathChanged"
            v-on:folder-created="refreshPending = true"
        ></toolbar>
        <v-row>
            <v-col v-if="tree && $vuetify.breakpoint.smAndUp" sm="auto">
                <v-col no-gutters>
                    <tree
                        :path="path"
                        :icons="icons"
                        :refreshPending="refreshPending"
                        :parentComponent="parentComponent"
                        :mode="mode"
                        v-on:path-changed="pathChanged"
                        v-on:loading="loadingChanged"
                        v-on:refreshed="refreshPending = false"
                    ></tree>
                    <v-divider horizontal></v-divider>
                    <bookmark>
                    </bookmark>
                </v-col>
            </v-col>
            <v-divider v-if="tree" vertical></v-divider>
            <v-col>
                <list
                    :path="path"
                    :icons="icons"
                    :refreshPending="refreshPending"
                    :parentComponent="parentComponent"
                    :mode="mode"
                    v-on:path-changed="pathChanged"
                    v-on:loading="loadingChanged"
                    v-on:refreshed="refreshPending = false"
                    v-on:file-deleted="refreshPending = true"
                ></list>
            </v-col>
        </v-row>
    </v-card>
</template>

<script>
import Toolbar from "./Toolbar.vue";
import Tree from "./Tree.vue";
import List from "./List.vue";
import Bookmark from "./Bookmark.vue";

const fileIcons = {
    zip: "mdi-folder-zip-outline",
    rar: "mdi-folder-zip-outline",
    htm: "mdi-language-html5",
    html: "mdi-language-html5",
    js: "mdi-nodejs",
    json: "mdi-json",
    md: "mdi-markdown",
    pdf: "mdi-file-pdf",
    png: "mdi-file-image",
    jpg: "mdi-file-image",
    jpeg: "mdi-file-image",
    tif: "mdi-file-image",
    tiff: "mdi-file-image",
    mp4: "mdi-filmstrip",
    mkv: "mdi-filmstrip",
    avi: "mdi-filmstrip",
    wmv: "mdi-filmstrip",
    mov: "mdi-filmstrip",
    txt: "mdi-file-document-outline",
    properties: "mdi-file-document-outline",
    xls: "mdi-file-excel",
    out: "mdi-file-document-outline",
    other: "mdi-file-outline"
};

export default {
    name: 'FileBrowser',
    components: {
        Toolbar,
        Tree,
        List,
        Bookmark
    },
    model: {
        prop: "path",
        event: "change"
    },
    props: {
        // comma-separated list of active storage codes
        // show tree view
        tree: { type: Boolean, default: true },
        // file icons set
        icons: { type: Object, default: () => fileIcons },
        // called from which component
        parentComponent: { type: String, default: "FilesManager"},
        // mode: manage, selectfile, selectfolder, selectfolders
        mode: {type: String, default: 'manage'},
        // initial path
        initialPath: {type: String, default: '/'}
    },
    data() {
        return {
            loading: 0,
            path: "",
            refreshPending: false
        };
    },
    computed: {
    },
    methods: {
        loadingChanged(loading) {
            if (loading) {
                this.loading++;
            } else if (this.loading > 0) {
                this.loading--;
            }
        },
        pathChanged(path) {
            if(path){
                this.path = path;
                this.$emit("change", path);                
            }
        }
    },
    mounted() {
        if(this.initialPath && this.initialPath !== '/')
                this.pathChanged(this.initialPath);
        else if (!this.path && !(this.tree && this.$vuetify.breakpoint.smAndUp)) {
                console.log("in here");
                this.pathChanged("/");
            }
    }
};
</script>

<style lang="scss" scoped>
</style>