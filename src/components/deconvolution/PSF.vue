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
                <v-col cols="10" sm="3" md="4">
                    <v-select
                        :items="psfModels"
                        v-model="serie.psfModel"
                        item-text="label"
                        item-value="value"
                        label="PSF Model"
                        outlined dense
                        >
                    </v-select>
                </v-col>
                
                <v-row v-if="serie.psfModel!==0">
                    <v-col cols="10" sm="3" md="4" style="padding-top: 25px;">
                        <v-select
                            :items="mediumRIOptions"
                            v-model="serie.mediumRIOption"
                            item-text="label"
                            item-value="value"
                            label="Sample medium RI options"
                            @change="mediumRIChanged"
                            outlined dense
                            >
                        </v-select>
                    </v-col>
                    <v-col cols="10" sm="3" md="4">
                        <v-text-field 
                            v-model="serie.ns"
                            @change="nsChanged"
                            regular 
                            label="Sample medium refractive index" 
                            type="number"
                            :rules="[rules.positive]">
                        </v-text-field>
                    </v-col>
                </v-row>
                
            </v-row>
            <v-row>
                <v-col cols="10" sm="3" md="4">
                    <v-text-field regular label="Objective NA" type="number" 
                        :rules="[rules.positive, rules.na_NARI]" v-model="serie.NA">
                    </v-text-field>
                </v-col>
                <v-col cols="10" sm="3" md="4" v-if="serie.psfType === 3">
                    <v-text-field regular label="Light sheet illumination NA" type="number"  
                        :rules="[rules.positive]" v-model="serie.lightSheetIlluminationNA">
                    </v-text-field>
                </v-col>
            
                <v-col cols="10" sm="3" md="4">
                    <v-text-field 
                        v-model="serie.RI"
                        @change="RIChanged"
                        regular 
                        label="Objective immersion refractive index"
                        :rules="[rules.positive, rules.ri_NARI]" 
                        type="number">
                    </v-text-field>
                </v-col>
                <v-col cols="10" sm="3" md="4" style="padding-top: 25px;">
                    <v-select
                        :items="objectiveRIOptions"
                        v-model="serie.objectiveRIOption"
                        item-text="label"
                        item-value="value"
                        label="Presets"
                        @change="objectiveRIChanged"
                        outlined dense
                        >
                    </v-select>
                </v-col>
            </v-row>

            <v-row>
                <v-col cols="10" sm="3" md="4" v-if="serie.psfType === 9 || serie.psfType === 10">
                    <v-text-field 
                        regular 
                        label="Objective magnification" 
                        type="number" 
                        :rules="[rules.positive]" 
                        v-model="serie.objMagnification">
                    </v-text-field>
                </v-col>
                <v-row v-if="serie.psfType === 9">
                    <v-col cols="10" sm="3" md="4">
                        <v-select
                            :items="lensFocalLength"
                            v-model="serie.lensFocalLength"
                            item-text="label"
                            item-value="value"
                            label="Tube lens focal length (mm)"
                            dense outlined 
                            >
                        </v-select>
                    </v-col>
                    <v-col cols="10" sm="3" md="4">
                        <v-text-field 
                            v-model="serie.slitWidth"
                            regular 
                            label="Emission slit width (microns)"
                            :rules="[rules.positive]" 
                            type="number">
                        </v-text-field>
                    </v-col>
                    <v-col cols="10" sm="3" md="4">
                        <v-select
                            :items="slitDirection"
                            v-model="serie.slitDirection"
                            item-text="label"
                            item-value="value"
                            label="Slit Direction"
                            outlined dense
                            >
                        </v-select>
                    </v-col>
                </v-row>
            </v-row>

        </v-col>


        <v-col v-if="!serie.generatePsf">
            <v-row align="center" justify="center">
                <v-progress-circular indeterminate color="primary" v-if="loading"></v-progress-circular>
                <v-col cols="30" sm="6" md="7">
                    <v-text-field regular label="PSF file" readonly
                            v-model="serie.psfFile" 
                            :rules="[rules.present]"
                            autofocus
                    >
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
                    X: {{ serie.psfX }}
                </v-col>
                <v-col cols="5" sm="2" md="2">
                    Y: {{ serie.psfY }}
                </v-col>
                <v-col cols="5" sm="2" md="2">
                    Z: {{ serie.swapPsfZT ? serie.psfT: serie.psfZ }}
                </v-col>
                <v-col cols="5" sm="2" md="2">
                    C: {{ serie.psfC }}
                </v-col>
                <v-col cols="5" sm="2" md="2">
                    T: {{ serie.swapPsfZT ? serie.psfZ: serie.psfT }}
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
                        v-model="serie.psfDr"
                        regular
                        type="number"
                        :rules="[rules.positive]"
                        :disabled="serie.psfReadSpacing" 
                        label="PSF Lateral spacing(nm/pixel)">
                    </v-text-field>
                </v-col>
                <v-col cols="15" sm="3" md="4">
                    <v-text-field 
                        v-model="serie.psfDz"
                        regular
                        type="number"
                        :rules="[rules.positive]"
                        :disabled="serie.psfReadSpacing" 
                        label="PSF Axial spacing(nm/slice)">
                    </v-text-field>
                </v-col>
                    <v-switch
                        v-model="serie.psfReadSpacing"
                        label="Read spacing from metadata"
                        @change="readSpacingChanged"
                        >
                    </v-switch>
            </v-row>
        </v-col>
    </v-card>
</template>

<script>
    import Vue from 'vue';
    import FileBrowserDialog from '@/components/FileBrowserDialog.vue'
    import PreferenceAPI from "@/api/PreferenceAPI"
    import DeconvolutionAPI from "@/api/DeconvolutionAPI"
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
                psfSerie: {},
                loading: false,
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
                lensFocalLength: [
                    {label: 'Leica (200 mm)', value: 0},
                    {label: 'Nikon (200 mm)', value: 1},
                    {label: 'Olympus (180 mm)', value: 2},
                    {label: 'Zeiss (165 mm)', value: 3},
                ],
                slitDirection : [
                    {label: 'Vertical', value: 0},
                    {label: 'Horizontal', value: 1},
                ],
                rules: {
                    present: value => !!value || 'Required! You need to load a file.',
                    positive: value => value && value > 0 || 'Must be a positive number',
                    na_NARI: value => value && value <= this.serie.RI || 'Object NA must be smaller than RI', 
                    ri_NARI: value => value && value >= this.serie.NA || 'Object NA must be smaller than RI',
                }
            }
        },
        methods: {
            // return the data
            get_serie(){
                return this.serie
            },
            async load_serie(serie){
                console.log("inside psf load serie")
                this.serie = serie
                if(this.serie.psfFile){
                    let _storedSeries = await PreferenceAPI.get_serie(this.serie.psfFile)
                    if ( _storedSeries && _storedSeries.length > 0 ) {
                        this.psfSerie = _storedSeries[0]
                    } else 
                        this.psfSerie = {}
                } else {

                    this.psfSerie = {}
                    
                }
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
               // this.valueChange()
            },
            // change ns from select
            mediumRIChanged(){
                if(this.serie.mediumRIOption > 0)
                    this.serie.ns = this.serie.mediumRIOption
               //this.valueChange()
            },
            // RI == Objective immersion refractive index : objectiveRIOptions
            // RI input
            RIChanged(){
                this.serie.RI = parseFloat(this.serie.RI)
                if(this.objectiveRIOptions.map(a => a.value).indexOf(this.serie.RI) === -1)
                    this.serie.objectiveRIOption = -1
                else
                    this.serie.objectiveRIOption = this.serie.RI
                //this.valueChange()
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
                        let _filePath = options.selectedItems[0].path
                        let storedSeries = await PreferenceAPI.get_serie(_filePath)
                        let _psfSerie = null
                        if ( storedSeries && storedSeries.length > 0 ) {
                            _psfSerie = storedSeries[0]
                        }
                        else {
                            this.loading = true
                            try{
                                let response = await DeconvolutionAPI.get_file_info(_filePath)
                                _psfSerie = response.commandResult[0]
                                await PreferenceAPI.create_serie(series.fixSeriesUnit(_psfSerie))
                            }
                            catch(err){
                                Vue.$log.info(err)
                            }
                            this.loading = false
                        }
                        this.psfSerie = Object.assign({}, _psfSerie)
                        this.serie = series.applyPsfToSeries(this.serie, _psfSerie)
                        // save, in case they quite before moving to new step
                        PreferenceAPI.update_setting(this.serie.id, this.serie)
                    }
                }
            },
            is_valid(){
                if(this.serie.generatePsf){
                    if ((this.serie.psfModel !== 1 || (this.serie.ns && this.serie.ns > 0)) &&
                        (this.serie.psfType !==3 || (this.serie.lightSheetIlluminationNA && this.serie.lightSheetIlluminationNA > 0) ) &&
                        (this.serie.NA && this.serie.NA > 0) && 
                        (this.serie.RI && this.serie.RI > 0))
                        return true
                    else
                        return false
                }
                else {
                    if( this.serie.psfFile && this.serie.psfDr && this.serie.psfDr >0 && this.serie.psfDz && this.serie.psfDz > 0)
                        return true
                    else
                        return false
                }
            },
            // when read spacing change
            readSpacingChanged(){
                if(this.serie.psfReadSpacing){
                    this.serie.psfDr = this.psfSerie.dr
                    this.serie.psfDz = this.psfSerie.dz
                }
            },
            /* valueChange(){
                PreferenceAPI.update_setting(this.serie.id, this.serie)
            } */
        },
        
        
    };
</script>