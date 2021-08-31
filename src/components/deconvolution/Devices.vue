<template>
    <v-card :disabled="readonly">
        <v-row align="center" justify="center">
            <!-- <v-switch
                v-model="serie.autoDetect"
                label="Autodetect"
                disabled
                >
            </v-switch> -->
        </v-row>
        <v-col align="center" justify="center">
            <v-col cols="15" sm="3" md="4">
                <v-tooltip right>
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field 
                            dense 
                            outlined
                            v-bind="attrs"
                            v-on="on"
                            type=number
                            :rules="positiveInteger"  
                            label="Number of instances [nodes]" 
                            v-model="serie.instances"
                        >
                        </v-text-field>
                    </template>
                    <span>The number of instances of Microvolution to be executed</span>
                </v-tooltip>
            </v-col>
            <v-col cols="15" sm="3" md="4">
                <v-tooltip right>
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field 
                            dense 
                            outlined
                            v-bind="attrs"
                            v-on="on"
                            type=number
                            :rules="positiveNumber"  
                            label="Memory per job (GBs)" 
                            v-model="serie.mem"
                        >
                        </v-text-field>
                    </template>
                    <span>The amount of memory (in Gbs) for each instance</span>
                </v-tooltip>
            </v-col>
            <v-col cols="15" sm="3" md="4">
                <v-tooltip right>
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field 
                            dense 
                            outlined
                            v-bind="attrs"
                            v-on="on"
                            type=number
                            :rules="positiveInteger"  
                            label="Number of GPUs per job" 
                            v-model="serie.gpus"
                        >
                        </v-text-field>
                    </template>
                    <span>The number of GPUs to be used for each job (or instance)</span>
                </v-tooltip>
            </v-col>
        </v-col>
        
    </v-card>

</template>

<script>
    // import Vue from 'vue';
    import series from '@/utils/series.js'
    export default {
        name: 'DeconvolutionDevices',
        props: {
            readonly: { type: Boolean, default: false }, 
        },
        data() {
            return {
                serie: series.formatSeries(null),
                positiveInteger: [
                    value => value && value > 0 && Number.isInteger(parseFloat(value)) || 'Must be a positive integer'
                ], 
                positiveNumber: [
                    value => value && value > 0 || 'Must be a positive number'
                ], 
            }
        },
        methods: {
            // return the data
            get_serie(){
                return this.serie
            },
            load_serie(serie_devices){
                this.serie = serie_devices
            },
            is_valid(){
                if(this.serie.instances && this.serie.instances >0
                    && this.serie.mem && this.serie.mem > 0 
                    && this.serie.gpus && this.serie.gpus > 0)
                    return true
                else
                    return false
            }
        },
        
  }
</script>

<style lang="scss" scoped>
</style>