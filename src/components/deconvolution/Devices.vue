<template>
    <v-card :disabled="readonly">
        <v-row align="center" justify="center">
            <v-switch
                v-model="serie.autoDetect"
                label="Autodetect"
                >
            </v-switch>
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
                            :rules="numberRules"  
                            label="Number of instances [nodes]" 
                            v-model="serie.numberOfParallelJobs"
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
                            :rules="numberRules"  
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
                            :rules="numberRules"  
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
                numberRules: [
                    value => ( value || value ===0 ) && String(value).match(/^\d+(\.\d+)?$/).length > 0 || 'Must be a positive number'
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
                if(this.serie.numberOfParallelJobs && this.serie.mem && this.serie.gpus)
                    return true
                else
                    return false
            }
        },
        
  }
</script>

<style lang="scss" scoped>
</style>