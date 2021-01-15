<template>
    <v-card :disabled="readonly">
        <v-row align="center" justify="center">    
            <v-col cols="20" sm="4" md="5">
                <v-text-field regular 
                    type="number"
                    :rules="metadataValuesRules" 
                    label="Lateral spacing(nm/pixel)" 
                    v-model="serie.dr"
                    :disabled="serie.readSpacing">
                </v-text-field>
                <v-text-field regular 
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
    </v-card>
</template>

<script>
    // import Vue from 'vue';
    import series from "@/utils/series.js"
    import PreferenceAPI from "@/api/PreferenceAPI"
    
    export default {
        name: 'DeconvolutionMetadata',
        props: {
            readonly: { type: Boolean, default: false }, 
        },
        data() {
            return {
                serie: series.formatSeries(null),
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
            }
        },
        watch: {
        },
  }
</script>

<style lang="scss" scoped>
</style>