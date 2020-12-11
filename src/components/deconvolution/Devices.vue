<template>
    <v-form
        ref="devicesform"
        lazy-validation
        >
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
                            label="Number of GPUs per job" 
                            v-model="serie.gpus"
                        >
                        </v-text-field>
                    </template>
                    <span>The number of GPUs to be used for each job (or instance)</span>
                </v-tooltip>
            </v-col>
        </v-col>
        
    </v-form>

</template>

<script>
    import Vue from 'vue';
    export default {
        name: 'DeconvolutionDevices',
        props: {
            selectedDevices: Object,
            disabled: Boolean,
        },
        data() {
            return {
                serie: this.selectedDevices
            }
        },
        methods: {
            // return the data
            get_series_modified(){
                return this.serie
            },
            load_new_series(serie_devices){
                Vue.$log.info('Loading ...');
                Vue.$log.info(serie_devices);
                this.serie = serie_devices
            }
        },
        
  }
</script>

<style lang="scss" scoped>
</style>