<template>
    <v-card :disabled="readonly">
        <file-browser-dialog ref="filedialog" />

        <v-row align="center" justify="center">
            <v-switch
                v-model="serie.generatePsf"
                label="Generate PSF"
                >
            </v-switch>
        </v-row>
        
        <v-col v-if="serie.generatePsf">
            <v-row>
                <v-col cols="15" sm="3" md="4">
                    <v-select
                        :items="psfModels"
                        v-model="serie.psfModel"
                        item-text="label"
                        item-value="value"
                        label="PSF Model"
                        outlined
                        >
                    </v-select>
                </v-col>
                <v-row v-if="serie.psfModel!==0">
                    <v-col cols="20" sm="4" md="5">
                        <v-text-field 
                            v-model="serie.ns"
                            @change="nsChanged"
                            regular 
                            label="Sample medium refractive index" 
                            type="number">
                        </v-text-field>
                    </v-col>

                    
                    <v-col cols="15" sm="3" md="4">
                        <v-select
                            :items="mediumRIOptions"
                            v-model="serie.mediumRIOption"
                            item-text="label"
                            item-value="value"
                            label="Sample medium RI options"
                            @change="mediumRIChanged"
                            outlined
                            single-line
                            >
                        </v-select>
                    </v-col>

                </v-row>
                
            </v-row>
            <v-row>
                <v-col cols="15" sm="3" md="4">
                    <v-text-field regular label="Objective NA" type="number" v-model="serie.NA">
                    </v-text-field>
                </v-col>
                <v-col cols="15" sm="3" md="4">
                    <v-text-field regular label="Light sheet illumination NA" type="number" v-model="serie.lightSheetIlluminationNA">
                    </v-text-field>
                </v-col>
            </v-row>

            <v-row>
                <v-col cols="15" sm="3" md="4">
                    <v-text-field 
                        v-model="serie.RI"
                        @change="RIChanged"
                        regular 
                        label="Objective immersion refractive index" 
                        type="number">
                    </v-text-field>
                </v-col>
                <v-col cols="15" sm="3" md="4">
                    <v-select
                        :items="objectiveRIOptions"
                        v-model="serie.objectiveRIOption"
                        item-text="label"
                        item-value="value"
                        label="Presets"
                        @change="objectiveRIChanged"
                        outlined
                        single-line
                        >
                    </v-select>
                </v-col>
            </v-row>

        </v-col>


        <v-col v-if="!serie.generatePsf">
            <v-row align="center" justify="center">
                <v-col cols="30" sm="6" md="7">
                    <v-text-field regular label="PSF file" v-model="serie.psfFile">
                    </v-text-field>
                </v-col>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn 
                            class="my-3" 
                            color="primary" 
                            fab dark large 
                            @click.stop="choosePsfFile"
                            v-bind="attrs" 
                            v-on="on">
                            <v-icon>mdi-file-find</v-icon>
                        </v-btn>
                    </template>
                    <span>Choose a PSF file</span>
                </v-tooltip>
            </v-row>
            <v-row>
                <v-col cols="5" sm="2" md="2">
                    X: {{ serie.psfInfo.x }}
                </v-col>
                <v-col cols="5" sm="2" md="2">
                    Y: {{ serie.psfInfo.y }}
                </v-col>
                <v-col cols="5" sm="2" md="2">
                    Z: {{ serie.swapPsfZT ? serie.psfInfo.t: serie.psfInfo.z }}
                </v-col>
                <v-col cols="5" sm="2" md="2">
                    C: {{ serie.psfInfo.c }}
                </v-col>
                <v-col cols="5" sm="2" md="2">
                    T: {{ serie.swapPsfZT ? serie.psfInfo.z: serie.psfInfo.t }}
                </v-col>
                    <v-switch
                    v-model="serie.swapPsfZT"
                    label="Swap PSF Z and T dimensions"
                    >
                </v-switch>
            </v-row>

            <v-row>
                <v-col cols="15" sm="3" md="4">
                    <v-text-field 
                        v-model="serie.psfInfo.dr"
                        regular
                        type="number"
                        :rules="psfValuesRules"
                        :disabled="serie.psfInfo.readSpacing" 
                        label="PSF Lateral spacing(nm/pixel)">
                    </v-text-field>
                </v-col>
                <v-col cols="15" sm="3" md="4">
                    <v-text-field 
                        v-model="serie.psfInfo.dz"
                        regular
                        type="number"
                        :rules="psfValuesRules"
                        :disabled="serie.psfInfo.readSpacing" 
                        label="PSF Axial spacing(nm/slice)">
                    </v-text-field>
                </v-col>
                    <v-switch
                        v-model="serie.psfInfo.readSpacing"
                        label="Read spacing from metadata"
                        >
                    </v-switch>
            </v-row>
        </v-col>
    </v-card>
</template>

<script>
    // import Vue from 'vue';
    import FileBrowserDialog from '@/components/FileBrowserDialog.vue'
    import series from "@/utils/series.js";
    
    export default {
        name: 'DeconvolutionPsf',
        components: {
            FileBrowserDialog,
        },
        props: {
            readonly: { type: Boolean, default: false }, 
        },
        data() {
            return {
                serie: series.formatSeries(null),

                psfModels: [
                    {label: 'Scalar', value: 0},
                    {label: 'Vectorial', value: 1},
                ],
                objectiveRIOptions: [
                    {label: 'Presets', value: -1, disabled: true},
                    {label: 'Air', value: 1},
                    {label: 'Water', value: 1.33},
                    {label: 'Oil, type A', value: 1.515},
                    {label: 'Oil, type F/N', value: 1.518},
                    {label: '80% Glycerol', value: 1.45},
                    {label: 'Silicon', value: 1.41},
                ],
                mediumRIOptions: [
                    {'label': 'Presets', 'value': -1, disabled: true},
                    {'label': 'Water', 'value': 1.33},
                    {'label': 'Vectashield', 'value': 1.46},
                    {'label': 'Prolong Gold', 'value': 1.44},
                    {'label': 'Fluoromount G', 'value': 1.4},
                    {'label': 'Mowiol(low RI)', 'value': 1.41},
                    {'label': 'Mowiol(low RI)', 'value': 1.49},
                    {'label': '80% Glycerol', 'value': 1.45}
                ],

                psfValuesRules: [
                    value => !!value || 'Must not empty',
                    value => value && value.match(/^\d+(\.\d+)?$/).length > 0 || 'Must be number'

                ],
            }
        },
        methods: {
            // return the data
            get_serie(){
                return this.serie
            },
            load_serie(serie){
                this.serie = serie
            },
            // psfModelChanged
            psfModelChanged() {
                console.log(this.serie.psfModel)
            },
            // ns === sample medium : mediumRIOptions
            // ns changed --
            nsChanged(){
                this.serie.ns = parseFloat(this.serie.ns)
                if(this.mediumRIOptions.map(a => a.value).indexOf(this.serie.ns) === -1)
                    this.serie.mediumRIOption = -1
                else
                    this.serie.mediumRIOption = this.serie.ns
            },
            // change ns from select
            mediumRIChanged(){
                if(this.serie.mediumRIOption > 0)
                    this.serie.ns = this.serie.mediumRIOption
            },
            // RI == Objective immersion refractive index : objectiveRIOptions
            // RI input
            RIChanged(){
                this.serie.RI = parseFloat(this.serie.RI)
                if(this.objectiveRIOptions.map(a => a.value).indexOf(this.serie.RI) === -1)
                    this.serie.objectiveRIOption = -1
                else
                    this.serie.objectiveRIOption = this.serie.RI
            },
            // change RI from select
            objectiveRIChanged(){
                if(this.serie.objectiveRIOption > 0)
                    this.serie.RI = this.serie.objectiveRIOption
            },
            // choose psf file
            async choosePsfFile(){
                let options = await this.$refs.filedialog.open('selectfile', 'Deconvolution', '/');
                if (!options.cancelled && options.path) {
                    if(options.selectedItems.length >0){
                        this.serie.psfFile = options.selectedItems[0].path
                        // TODO: load psffile
                    }
                }
            },
            is_valid(){
                if( this.serie.psfInfo.dr && this.serie.psfInfo.dz)
                    return true
                else
                    return false
            }
        }
        
    };
</script>