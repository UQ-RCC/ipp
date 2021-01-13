<template>
    <v-card :disabled="readonly">
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
                        :rules="numberRules"  
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
                        :rules="numberRules"  
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
                        :rules="numberRules"  
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
                        type="number"
                        :rules="numberRules" 
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
                        :rules="numberRules" 
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
                        :rules="numberRules"  
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
                    >
                </v-select>
            </v-col>
            <v-col cols="15" sm="3" md="4">
                <v-select
                    disabled
                    :items="fileFormatTypes"
                    v-model="serie.fileformat"
                    item-text="label"
                    item-value="value"
                    label="File format"
                    outlined dense
                    >
                </v-select>
            </v-col>
        </v-row>

        <v-row align="center" justify="center">
            <v-col cols="15" sm="3" md="4">
                <v-select
                    disabled
                    :items="splitChannelTypes"
                    v-model="serie.split"
                    item-text="label"
                    item-value="value"
                    label="Stack split"
                    outlined dense
                    >
                </v-select>
            </v-col>
            <v-col cols="15" sm="3" md="4">
                <v-text-field
                    v-if="serie.split !== 0"
                    dense 
                    outlined
                    type=number
                    :rules="positiveIntegerRules"  
                    label="Split Index" 
                    v-model="serie.splitIdx"
                />
            </v-col>
        </v-row>

    </v-card>

</template>

<script>
    // import Vue from 'vue';
    import series from '@/utils/series.js'
    
    export default {
        name: 'DeconvolutionAdvanced',
        props: {
            readonly: { type: Boolean, default: false },
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
                ],
                numberRules: [
                    value => value && parseInt(value) >= 0 || "Must be 0 or a positive number"
                ],
                positiveIntegerRules: [
                    value => value && Number.isInteger(parseFloat(value)) && parseInt(value) >= 0 || 'Must be a positive integer'
                ],
            }
        },
        methods: {
            // return the data
            get_serie(){
                return this.serie
            },
            load_serie(serie_advanced){
                this.serie = serie_advanced
            },
            is_valid_value(val){
                if(val || val == 0)
                    return true
                else
                    return false
            }
            ,
            is_valid(){
                if(this.serie.padding && 
                    this.is_valid_value(this.serie.padding.x) &&
                    this.is_valid_value(this.serie.padding.y) &&
                    this.is_valid_value(this.serie.padding.z) &&
                    this.serie.tiling && 
                    this.is_valid_value(this.serie.padding.x) &&
                    this.is_valid_value(this.serie.padding.y) &&
                    this.is_valid_value(this.serie.padding.z))
                    return true
                else
                    return false
            }
        },
  }
</script>

<style lang="scss" scoped>
</style>