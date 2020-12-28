<template>
    <v-form
        ref="advancedform"
        lazy-validation
        >
         <v-row align="center" justify="center">
            <v-switch
                v-model="serie.blindDeconvolution"
                label="Use blind deconvolution"
                >
            </v-switch>
        </v-row>
            
        <v-col>
            <v-row align="center" justify="center">
                <v-col cols="15" sm="3" md="4">
                    <v-text-field 
                        dense 
                        outlined
                        type=number 
                        label="Padding.X" 
                        v-model="serie.padding.x"
                    >
                    </v-text-field>
                </v-col>
                <v-col cols="15" sm="3" md="4">
                    <v-text-field 
                        dense 
                        outlined
                        type=number 
                        label="Padding.Y" 
                        v-model="serie.padding.y"
                    >
                    </v-text-field>
                </v-col>
                <v-col cols="15" sm="3" md="4">
                    <v-text-field 
                        dense 
                        outlined
                        type=number 
                        label="Padding.Z" 
                        v-model="serie.padding.z"
                    >
                    </v-text-field>
                </v-col>
            </v-row>
            
            <v-row align="center" justify="center">
                <v-col cols="15" sm="3" md="4">
                    <v-text-field 
                        dense 
                        outlined
                        type=number 
                        label="Tiling.X" 
                        v-model="serie.tiling.x"
                    >
                    </v-text-field>
                </v-col>
                <v-col cols="15" sm="3" md="4">
                    <v-text-field 
                        dense 
                        outlined 
                        type=number
                        label="Tiling.Y" 
                        v-model="serie.tiling.y"
                    >
                    </v-text-field>
                </v-col>
                <v-col cols="15" sm="3" md="4">
                    <v-text-field
                        dense 
                        outlined
                        type=number 
                        label="Tiling.Z" 
                        v-model="serie.tiling.z"
                    >
                    </v-text-field>
                </v-col>
            </v-row>
        </v-col>


        <v-row align="center" justify="center">
            <v-col cols="15" sm="3" md="4">
                <v-select
                    :items="scalingTypes"
                    v-model="serie.scaling"
                    item-text="label"
                    item-value="value"
                    label="Output image type"
                    outlined dense
                    return-object
                    >
                </v-select>
            </v-col>
            <v-col cols="15" sm="3" md="4">
                <v-select
                    :items="fileFormatTypes"
                    v-model="serie.fileformat"
                    item-text="label"
                    item-value="value"
                    label="File format"
                    outlined dense
                    return-object
                    >
                </v-select>
            </v-col>
        </v-row>

        <v-row align="center" justify="center">
            <v-col cols="15" sm="3" md="4">
                <v-select
                    :items="splitChannelTypes"
                    v-model="serie.split"
                    item-text="label"
                    item-value="value"
                    label="Stack split"
                    outlined dense
                    return-object
                    >
                </v-select>
            </v-col>
            <v-col cols="15" sm="3" md="4">
                <v-select
                    :items="splitStartingIndexTypes"
                    v-model="serie.splitIdx"
                    item-text="label"
                    item-value="value"
                    label="Split starting index"
                    outlined dense
                    return-object
                    >
                </v-select>
            </v-col>
        </v-row>

    </v-form>

</template>

<script>
    import Vue from 'vue';
    import series from '@/utils/series.js'
    
    export default {
        name: 'DeconvolutionAdvanced',
        props: {
            selectedAdvanced: Object,
            disabled: Boolean,
        },
        data() {
            return {
                serie:series.formatSeries(null),
                scalingTypes: [
                    {'label': '32-bit (default)', 'value': 0},
                    {'label': 'Same as input', 'value': 1}
                ],
                fileFormatTypes: [
                    {'label': 'TIFF', 'value': 0},
                    {'label': 'OME-TIFF', 'value': 1}, 
                    {'label': 'HDF5', 'value': 2}, 
                    {'label': 'Imaris 5.0', 'value': 3},
                    {'label': 'Slidebook 6.0', 'value': 4}, 
                    {'label': 'Arivis .SIS', 'value': 5}
                ],
                splitChannelTypes: [
                    {'label': 'No Split', 'value': 0},
                    {'label': 'Split channels', 'value': 1}, 
                    {'label': 'Split timepoints', 'value': 2}, 
                    {'label': 'Split channels and timepoints', 'value': 3} 
                    
                ],
                splitStartingIndexTypes: [
                    {'label': '0', 'value': 0},
                    {'label': '1', 'value': 1}  
                ]
            }
        },
        methods: {
            // return the data
            get_series_modified(){
                return this.serie
            },
            load_new_series(serie_advanced){
                Vue.$log.info('Loading ...');
                Vue.$log.info(serie_advanced);
                this.serie = serie_advanced
            }
        },
  }
</script>

<style lang="scss" scoped>
</style>