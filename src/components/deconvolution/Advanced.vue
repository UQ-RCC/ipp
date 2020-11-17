<template>
    <v-form
        ref="advancedform"
        v-model="advanced.valid"
        lazy-validation
        >
         <v-row align="center" justify="center">
            <v-switch
                v-model="advanced.blindDeconvolution"
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
                        v-model="advanced.padding.x"
                    >
                    </v-text-field>
                </v-col>
                <v-col cols="15" sm="3" md="4">
                    <v-text-field 
                        dense 
                        outlined
                        type=number 
                        label="Tiling.X" 
                        v-model="advanced.tiling.x"
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
                        label="Padding.Y" 
                        v-model="advanced.padding.y"
                    >
                    </v-text-field>
                </v-col>
                <v-col cols="15" sm="3" md="4">
                    <v-text-field 
                        dense 
                        outlined 
                        type=number
                        label="Tiling.Y" 
                        v-model="advanced.tiling.y"
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
                        label="Padding.Z" 
                        v-model="advanced.padding.z"
                    >
                    </v-text-field>
                </v-col>
                <v-col cols="15" sm="3" md="4">
                    <v-text-field
                        dense 
                        outlined
                        type=number 
                        label="Tiling.Z" 
                        v-model="advanced.tiling.z"
                    >
                    </v-text-field>
                </v-col>
            </v-row>
        </v-col>

        <v-divider horizontal></v-divider>

        <v-row align="center" justify="center">
            <v-col cols="15" sm="3" md="4">
                <v-select
                    :items="scalingTypes"
                    v-model="advanced.scaling"
                    item-text="label"
                    item-value="value"
                    label="Output image type"
                    outlined
                    return-object
                    >
                </v-select>
            </v-col>
            <v-col cols="15" sm="3" md="4">
                <v-select
                    :items="fileFormatTypes"
                    v-model="advanced.fileformat"
                    item-text="label"
                    item-value="value"
                    label="File format"
                    outlined
                    return-object
                    >
                </v-select>
            </v-col>
        </v-row>

        <v-row align="center" justify="center">
            <v-col cols="15" sm="3" md="4">
                <v-select
                    :items="splitChannelTypes"
                    v-model="advanced.split"
                    item-text="label"
                    item-value="value"
                    label="Stack split"
                    outlined
                    return-object
                    >
                </v-select>
            </v-col>
            <v-col cols="15" sm="3" md="4">
                <v-select
                    :items="splitStartingIndexTypes"
                    v-model="advanced.splitIdx"
                    item-text="label"
                    item-value="value"
                    label="Split starting index"
                    outlined
                    return-object
                    >
                </v-select>
            </v-col>
        </v-row>

    </v-form>

</template>

<script>
    export default {
        name: 'DeconvolutionAdvanced',
        props: {
            // path of the series - can be file, folder
            path: String,
        },
        data() {
            return {
                advanced:{
                    valid: true,
                    blindDeconvolution: false,
                    padding: {x: 0, y: 0, z: 0},
                    tiling: {x: 0, y: 0, z: 0},
                    scaling: {'label': '32-bit (default)', 'value': 0},
                    fileformat: {'label': 'TIFF', 'value': 0},
                    split: {'label': 'No Split', 'value': 0},
                    splitIdx: {'label': '0', 'value': 0}
                },
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
            // load the settings from database - or else set to default
            async load(){
                this.$emit("loading", true);
            }
        },
        watch: {
            async path() {
                // path changed
                await this.load();
            },
        }
  }
</script>

<style lang="scss" scoped>
</style>