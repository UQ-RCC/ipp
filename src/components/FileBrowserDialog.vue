<template>

    <v-dialog v-model="dialog" persistent scrollable max-height="80%" max-width="80%">
        <v-card>
            <v-card-title class="headline grey lighten-2">
                {{ dialogTitle }}
            </v-card-title>
            
            <file-browser
                :parentComponent=options.parentComponent
                :initialPath=options.initialPath
                :mode = options.mode
                v-on:change="pathChanged"
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
                cancelled: false
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
                this.dialog = true;
                this.options.mode = mode;
                this.options.parentComponent = parentComponent;
                this.options.initialPath = initPath;
                return new Promise((resolve, reject) => {
                    this.resolve = resolve;
                    this.reject = reject;
                });
            },
            agree() {
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
                this.options.path = path;
            }
        }
    }

</script>