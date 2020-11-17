<template>
    <v-form
        ref="noiseform"
        v-model="noise.valid"
        lazy-validation
        >
        <v-row >
             <v-select
                :items="regularizationTypes"
                v-model="noise.regularizationType"
                item-text="label"
                item-value="value"
                label="Regularization Type"
                outlined
                return-object
                >
            </v-select>
        </v-row>
        
        <v-row  v-if="noise.regularizationType.value !== 0">
            <v-col cols="20" sm="4" md="5">
                <v-switch
                    v-model="noise.automaticRegularizationScale"
                    label=" Automatic regularization scale factor"
                    >
                </v-switch>
            </v-col>
            <v-col cols="20" sm="4" md="5">
                <v-text-field 
                    v-model="noise.regularization"
                    regular
                    type=number
                    :disabled="noise.automaticRegularizationScale"
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
             <v-select
                :items="preFilterTypes"
                v-model="noise.prefilter"
                item-text="label"
                item-value="value"
                label="Pre-filter"
                outlined
                return-object
                >
            </v-select>
        </v-row>

        <v-row >
             <v-select
                :items="postFilterTypes"
                v-model="noise.postfilter"
                item-text="label"
                item-value="value"
                label="Post-filter"
                outlined
                return-object
                >
            </v-select>
        </v-row>

    </v-form>

</template>

<script>
    export default {
        name: 'DeconvolutionNoise',
        props: {
            // path of the series - can be file, folder
            path: String,
        },
        data() {
            return {
                noise:{
                    valid: true,
                    regularizationType: {'label': 'None', 'value': 0}, 
                    prefilter:0 ,
                    postfilter: 0,
                    automaticRegularizationScale: true,
                    regularization: -1
                },
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