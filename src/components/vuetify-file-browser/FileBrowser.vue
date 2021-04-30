<template>
    <v-card>
        <v-progress-linear
            color="primary accent-4"
            indeterminate
            rounded
            height="4"
            :active="loading"
        ></v-progress-linear>
        <br />
        <toolbar
            :prefid = prefid
            :path = path
            :parentComponent = parentComponent
            :mode = mode
            :lastpaths = pref.lastpaths
            v-on:bookmark-changed = bookmarkChanged
            v-on:path-changed = pathChanged
            v-on:folder-created = "refreshPending = true"
        ></toolbar>
        <v-row>
            <v-col v-if="tree && $vuetify.breakpoint.smAndUp" sm="auto">
                <v-col no-gutters>
                    <tree
                        :path = path
                        :icons = icons
                        :refreshPending = refreshPending
                        :parentComponent = parentComponent
                        :mode = mode
                        v-on:path-changed = pathChanged
                        v-on:loading = loadingChanged
                        v-on:refreshed = "refreshPending = false"
                    ></tree>
                    <v-divider horizontal></v-divider>
                    <bookmark
                        :parentComponent = parentComponent
                        :prefid = prefid
                        :bookmarks = pref.bookmarks
                        v-on:bookmark-changed = bookmarkChanged
                        v-on:path-changed = pathChanged
                    >
                    </bookmark>
                </v-col>
            </v-col>
            <v-divider v-if="tree" vertical></v-divider>
            <v-col>
                <list
                    :path = path
                    :icons = icons
                    :refreshPending = refreshPending
                    :parentComponent = parentComponent
                    :mode = mode
                    v-on:path-changed = pathChanged
                    v-on:filter-changed = filterChanged
                    v-on:maxsize-changed = maxSizeChanged
                    v-on:selected-items-changed = selectedItemsChanged
                    v-on:loading = loadingChanged
                    v-on:refreshed = "refreshPending = false"
                    v-on:file-deleted = "refreshPending = true"
                    ref="filelist"
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
import PreferenceAPI from "@/api/PreferenceAPI";
import Vue from 'vue';

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
            loading: false,
            path: "",
            filter: "",
            prefid: -1,
            refreshPending: false,
            pref: {}
        };
    },
    computed: {
    },
    methods: {
        loadingChanged(loading) {
            this.loading = loading
        },
        pathChanged(path) {
            if(path){
                this.path = path;
                this.$emit("change", path);
                this.savePref()                
            }
        },
        filterChanged(filter) {
            if(filter){
                this.filter = filter;
                this.$emit("filter", filter);
                this.savePref()                
            }
        },
        maxSizeChanged(maxsize){
            this.$emit("maxsize", maxsize);
        },
        selectedItemsChanged(items){
            this.$emit("selected", items);
        },
        async savePref(){
            var new_pref = {
                currentpath: this.path,
                filters: this.filter
            }
            console.log(new_pref)
            if(this.prefid > 0)
                this.pref = await PreferenceAPI.update_filesxplorer_pref(this.parentComponent, this.prefid, new_pref)
        },
        async getPref(){
            //get pref
            this.pref = await PreferenceAPI.get_filesxplorer_pref(this.parentComponent);
            Vue.$log.info('Pref response');
            Vue.$log.info(this.pref);
            // update pref
            this.path = this.pref.currentpath;
            this.filter = this.pref.filters;
            this.prefid = this.pref.id;
            // Vue.$log.info(this.pref.lastpaths);
            // emit path changed
            this.$emit("change", this.path);
        },
        async bookmarkChanged(){
            this.getPref();
        },
        // clear selected item from list
        clearSelectedItem(){
            this.$refs.filelist.clearSelectedItem()
        }
    },
    mounted() {
        console.log("-------------filebrowser mounted-------------")
        // init
        if(this.initialPath && this.initialPath !== '/') {
            this.pathChanged(this.initialPath);
        }
        else if (!this.path && !(this.tree && this.$vuetify.breakpoint.smAndUp)) {
            console.log("in here");
            this.pathChanged("/");
        }
        this.getPref();
    }
};
</script>

<style lang="scss" scoped>
</style>