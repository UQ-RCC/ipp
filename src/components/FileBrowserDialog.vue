<template>

    <v-dialog v-model="dialog" persistent fullscreen hide-overlay>
        <v-card>
            <v-toolbar dark color="#49075e">
                <v-btn icon dark @click="cancel">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-card-title class="headline">
                    {{ dialogTitle }}
                </v-card-title>
            </v-toolbar>

            <file-browser
                :parentComponent=options.parentComponent
                :initialPath=options.initialPath
                :mode = options.mode
                v-on:change="pathChanged"
                v-on:filter="filterChanged"
                v-on:maxsize="maxsizeChanged"
                v-on:selected="selectedItemsChanged"
                ref="filebrowser1"
            />

            <v-divider></v-divider>
            <v-card-actions align="center" style="background-color: 'grey';">
                <v-btn class="my-1" color="success" rounded dark large @click="agree"> 
                    Select
                </v-btn>
                <v-btn class="my-1" color="warning" rounded dark large @click="cancel"> 
                    Cancel
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

</template>

<script>
    // import FileBrowser from "./vuetify-file-browser/";
    import Vue from 'vue'

    export default {
        name: 'FileBrowserDialog',
        components: {
            FileBrowser: () => import('./vuetify-file-browser/')
        },
        data: () => ({
            dialog: false,
            resolve: null,
            reject: null,
            options:{
                mode: 'selectfolders',
                parentComponent: 'filesmanager',
                initialPath: '/',
                path: '/bleh',
                filter: '',
                maxsize: 0,
                cancelled: false,
                selectedItems: []
            }
        }),
        computed: {
            dialogTitle(){
                if (this.options.mode === 'selectfilesinfolder'){
                    return 'Select files in a folder';
                }
                else if(this.options.mode === 'selectfiles'){
                    return 'Select files';
                }
                else if(this.options.mode === 'selectfile'){
                    return 'Select a single file';
                }
                else if(this.options.mode === 'selectfolder'){
                    return 'Select a folder';
                }
                return "";
            }
        },
        mounted: function() {
        },
        methods: {
            open(mode, parentComponent, initPath) {
                this.dialog = true
                this.options.mode = mode
                this.options.parentComponent = parentComponent
                this.options.initialPath = initPath
                this.options.selectedItems = []
                this.options.filter = ''
                this.options.maxsize = 0
                if(this.$refs.filebrowser1)
                    this.$refs.filebrowser1.clearSelectedItem()
                return new Promise((resolve, reject) => {
                    this.resolve = resolve;
                    this.reject = reject;
                });
            },
            agree() {
                if(this.options.filter == ''){
                    Vue.notify({
                        group: 'datanotif',
                        type: 'warning',
                        title: 'Please use filter to filter out items',
                        text: 'It seems that you have not filtered out anything. Make sure hit enter or press Update filter button.'
                    })
                    return
                }
                this.options.cancelled = false;
                this.resolve(this.options);
                this.dialog = false;
            },
            cancel() {
                this.options.cancelled = true;
                this.resolve(this.options);
                this.dialog = false;
            },
            pathChanged(path) {
                this.options.path = path
            },
            filterChanged(filter) {
                if(filter){
                    this.options.filter = filter
                }
            },
            maxsizeChanged(maxsize) {
                this.options.maxsize = maxsize
            },
            selectedItemsChanged(items){
                this.options.selectedItems = items;
            }
        }
    }

</script>

<style lang="scss" scoped>
</style>