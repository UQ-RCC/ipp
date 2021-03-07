<template>
    <v-card :disabled="readonly">
        <file-browser-dialog ref="filedialog" />

        <v-row align="center" justify="center">    
            <v-col cols="20" sm="4" md="5">
                <v-text-field regular 
                    type="number"
                    :rules="metadataValuesRules" 
                    label="Lateral spacing(nm/pixel)" 
                    v-model="serie.dr"
                    :disabled="serie.readSpacing"
                    autofocus>
                </v-text-field>
                <v-text-field 
                    type="number" 
                    :rules="metadataValuesRules" 
                    label="Axial spacing(nm/slice)" 
                    v-model="serie.dz"
                    :disabled="serie.readSpacing">
                </v-text-field>
            </v-col>
            <v-row align="center" justify="center">
                <v-switch
                    v-model="serie.readSpacing"
                    label="Read spacing from metadata"
                    @change="readSpacingChange"
                    >
                </v-switch>
            </v-row>
        </v-row>
        <v-row>
            <v-col cols="5" sm="2" md="2">
                X: {{ serie.x }}
            </v-col>
            <v-col cols="5" sm="2" md="2">
                Y: {{ serie.y }}
            </v-col>
            <v-col cols="5" sm="2" md="2">
                Z: {{ serie.swapZT ? serie.t: serie.z }}
            </v-col>
            <v-col cols="5" sm="2" md="2">
                C: {{ serie.c }} 
            </v-col>
            <v-col cols="5" sm="2" md="2">
                T: {{ serie.swapZT ? serie.z: serie.t }}
            </v-col>
        </v-row>
        <v-row align="center" justify="center">
            <v-switch
                v-model="serie.swapZT"
                label="Swap Z and T dimensions"
                >
            </v-switch>
        </v-row>

        <v-row align="center" justify="center">
            <v-col cols="30" sm="6" md="7">
                <v-text-field
                    label="Output Base Path"
                    hide-details="auto"
                    class="my-2"
                    v-model="outputBasePath"
                    @change="outputPathChanged"
                ></v-text-field>
            </v-col>
            <v-col cols="10" sm="3" md="4">
                <v-text-field
                    label="Output Folder Name"
                    hide-details="auto"
                    class="my-2"
                    v-model="outputFolderName"
                    @change="outputPathChanged"
                ></v-text-field>
            </v-col>
        </v-row>
        <div align="center" justify="center">
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn 
                        class="my-3" 
                        color="primary" 
                        @click.stop="chooseOutputFolder"
                        rounded dark large 
                        v-bind="attrs" v-on="on"
                        >
                        Choose Output Folder
                    </v-btn>
                </template>
                <span>Select where to save the outputs</span>
            </v-tooltip>
        </div>


    </v-card>
</template>

<script>
    // import Vue from 'vue';
    import series from "@/utils/series.js"
    import PreferenceAPI from "@/api/PreferenceAPI"
    import FileBrowserDialog from '@/components/FileBrowserDialog.vue'
    
    export default {
        name: 'DeconvolutionMetadata',
        props: {
            readonly: { type: Boolean, default: false }, 
        },
        components: {
            FileBrowserDialog,
        },
        data() {
            return {
                serie: series.formatSeries(null),
                outputBasePath: '',
                outputFolderName: '',
                origionalSerie: {}, 
                metadataValuesRules: [
                    value => value && value > 0 || 'Must be a positive number'
                ], 
            }
        },
        methods: {
            // return the data
            get_serie(){
                return this.serie
            },
            async load_serie(serie){
                this.serie = serie
                // load origional serie
                if(this.serie.path){
                    let _storedSeries = await PreferenceAPI.get_serie(this.serie.path)
                    if ( _storedSeries && _storedSeries.length > 0 ) {
                        this.origionalSerie = _storedSeries[0]
                    } else 
                        this.origionalSerie = {}
                } else
                    this.origionalSerie = {}
                // update outputpath
                if(serie.outputPath) {
                    var _pathParts = serie.outputPath.split("/")
                    this.outputBasePath = _pathParts.slice(0,-1).join("/")
                    this.outputFolderName = _pathParts.slice(-1)[0]
                } else {
                    this.outputBasePath = ""
                    this.outputFolderName = ""
                }
            },
            is_valid(){
                if( this.serie.dr && this.serie.dr > 0 && this.serie.dz && this.serie.dz > 0)
                    return true
                else
                    return false
            },
            readSpacingChange(){
                if(this.serie.readSpacing){
                    this.serie.dr = this.origionalSerie.dr
                    this.serie.dz = this.origionalSerie.dz
                }
            },
            outputPathChanged(){
                if(this.outputBasePath==='')
                    this.serie.outputPath = ''
                else
                    this.serie.outputPath = this.outputBasePath + "/" + this.outputFolderName
            },
            /**
             * choose output folder: saved to all selected series
             */
            async chooseOutputFolder(){
                let options = await this.$refs.filedialog.open('selectfolder', 'Deconvolution', '/');
                if (!options.cancelled && options.path) {
                    var selectedFolder = options.path;
                    if(selectedFolder.endsWith('/'))
                        selectedFolder = selectedFolder.slice(0, -1);
                    var _pathParts = selectedFolder.split("/");
                    this.outputBasePath = _pathParts.slice(0,-1).join("/")
                    this.outputFolderName = _pathParts.slice(-1)[0]
                }
            },
        },
    }
</script>

<style lang="scss" scoped>
</style>