<template>
    <v-card>
        <v-row align="center" justify="center">    
            <v-col cols="20" sm="4" md="5">
                <v-text-field regular 
                    type="number" 
                    label="Lateral spacing(nm/pixel)" 
                    v-model="serie.dr" 
                    :readonly="serie.readSpacing">
                </v-text-field>
                <v-text-field regular 
                    type="number" 
                    label="Axial spacing(nm/slice)" 
                    v-model="serie.dz" 
                    :readonly="serie.readSpacing">
                </v-text-field>
            </v-col>
            <v-row align="center" justify="center">
                <v-switch
                    v-model="serie.readSpacing"
                    label="Read spacing from metadata"
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
    import Vue from 'vue';
    import series from "@/utils/series.js";

    export default {
        name: 'DeconvolutionMetadata',
        data() {
            return {
                valid: true,
                serie: series.formatSeries(null)
            }
        },
        methods: {
            // return the data
            get_serie(){
                return this.serie
            },
            load_serie(serie){
                Vue.$log.info('Loading ...');
                Vue.$log.info(serie);
                this.serie = serie
            }
        },
        watch: {
            // async path() {
            //     // path changed
            //     await this.load();
            // },
        }
  }
</script>

<style lang="scss" scoped>
</style>