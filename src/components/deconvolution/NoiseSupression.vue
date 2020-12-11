<template>
    <v-form
        ref="noiseform"
        lazy-validation
        >
        <v-row >
            <v-col cols="60" sm="12" md="15">
                <v-select
                    :items="regularizationTypes"
                    v-model="serie.regularizationType"
                    item-text="label"
                    item-value="value"
                    label="Regularization Type"
                    outlined
                    return-object
                    >
                </v-select>
            </v-col>
        </v-row>
        
        <v-row  v-if="serie.regularizationType.value !== 0">
            <v-col cols="20" sm="4" md="5">
                <v-switch
                    v-model="serie.automaticRegularizationScale"
                    label=" Automatic regularization scale factor"
                    >
                </v-switch>
            </v-col>
            <v-col cols="20" sm="4" md="5">
                <v-text-field 
                    v-model="serie.regularization"
                    regular
                    type=number
                    :disabled="serie.automaticRegularizationScale"
                    label="Regularization scale factor (µ)">
                </v-text-field>
            </v-col>
            <v-row align="center" justify="center">
                <h5>
                    Note: Larger scale factor = less regularization
                </h5>
            </v-row>
        </v-row>

        <v-row >
            <v-col cols="60" sm="12" md="15">
                <v-select
                    :items="preFilterTypes"
                    v-model="serie.prefilter"
                    item-text="label"
                    item-value="value"
                    label="Pre-filter"
                    outlined
                    return-object
                    >
                </v-select>
            </v-col>
        </v-row>

        <v-row >
            <v-col cols="60" sm="12" md="15">
                <v-select
                    :items="postFilterTypes"
                    v-model="serie.postfilter"
                    item-text="label"
                    item-value="value"
                    label="Post-filter"
                    outlined
                    return-object
                    >
                </v-select>
            </v-col>
        </v-row>

    </v-form>

</template>

<script>
    import Vue from 'vue';
    export default {
        name: 'DeconvolutionNoise',
        props: {
            selectedNoise: Object,
            disabled: Boolean,
        },
        data() {
            return {
                serie: this.selectedNoise,
                regularizationTypes: [
                    {'label': 'None', 'value': 0},
                    {'label': 'TV', 'value': 1},
                    {'label': 'Entropy', 'value': 2}
                ],
                preFilterTypes: [
                    {'label': 'None', 'value': 0},
                    {'label': 'GaussianImage', 'value': 1},
                    {'label': 'GaussianImageAndPSF', 'value': 2},
                    {'label': 'MedianImage', 'value': 3}
                ],
                postFilterTypes: [
                    {'label': 'None', 'value': 0},
                    {'label': 'Gaussian', 'value': 1},
                    {'label': 'Median', 'value': 2},
                    {'label': 'SharpenFilter', 'value': 3}
                ],
            }
        },
        methods: {
            // return the data
            get_series_modified(){
                return this.serie
            },
            load_new_series(serie_noise){
                Vue.$log.info('Loading ...');
                Vue.$log.info(serie_noise);
                this.serie = serie_noise
            }
        },
  }
</script>

<style lang="scss" scoped>
</style>