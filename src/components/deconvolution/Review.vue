<template>
    <v-expansion-panels>
        <v-expansion-panel>
            <v-expansion-panel-header>Metadata</v-expansion-panel-header>
            <v-expansion-panel-content>
                <deconvolution-metadata ref="revdeconmetadata"/>
            </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel>
            <v-expansion-panel-header>PSF</v-expansion-panel-header>
            <v-expansion-panel-content>
                <deconvolution-psf ref="revdeconpsf"/>
            </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel v-if="serie.psfType === 3">
            <v-expansion-panel-header>Deskew</v-expansion-panel-header>
            <v-expansion-panel-content>
                <deconvolution-deskew ref="revdecondeskew"/>
            </v-expansion-panel-content>
        </v-expansion-panel>


        <v-expansion-panel>
            <v-expansion-panel-header>Iterations</v-expansion-panel-header>
            <v-expansion-panel-content>
                <deconvolution-iterations ref="deconiterations"/>
            </v-expansion-panel-content>
        </v-expansion-panel>


        <v-expansion-panel>
            <v-expansion-panel-header>Noise Suppression</v-expansion-panel-header>
            <v-expansion-panel-content>
                <deconvolution-noise ref="revdeconnoise"/>
            </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel>
            <v-expansion-panel-header>Advanced</v-expansion-panel-header>
            <v-expansion-panel-content>
                <deconvolution-advanced ref="revdeconadvanced"/>
            </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel>
            <v-expansion-panel-header>Devices</v-expansion-panel-header>
            <v-expansion-panel-content>
                <deconvolution-devices ref="revdecondevices"/>
            </v-expansion-panel-content>
        </v-expansion-panel>

        <v-row align="center" justify="center">
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn 
                        class="my-3" 
                        color="primary" 
                        round dark large 
                        @click.stop="savetemplate()"
                        v-bind="attrs" 
                        v-on="on">Load Template
                    </v-btn>
                </template>
                <span>Load an existing template</span>
            </v-tooltip>

            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn  class="my-3" 
                            color="primary"
                            @click.stop="loadtemplate()" 
                            round dark large 
                            v-bind="attrs" 
                            v-on="on">Save Template
                    </v-btn>
                </template>
                <span>Save template</span>
            </v-tooltip>
        </v-row>
    </v-expansion-panels>





</template>

<script>
    // import Vue from 'vue'
    import DeconvolutionMetadata from '@/components/deconvolution/Metadata.vue'
    import DeconvolutionPsf from '@/components/deconvolution/PSF.vue'
    import DeconvolutionDeskew from '@/components/deconvolution/Deskew.vue'
    import DeconvolutionIterations from '@/components/deconvolution/Iterations.vue'
    import DeconvolutionNoise from '@/components/deconvolution/NoiseSupression.vue'
    import DeconvolutionAdvanced from '@/components/deconvolution/Advanced.vue'
    import DeconvolutionDevices from '@/components/deconvolution/Devices.vue'

    import series from "@/utils/series.js";

    export default {
        name: 'DeconvolutionReview',
        components: {
            DeconvolutionMetadata,
            DeconvolutionPsf,
            DeconvolutionDeskew,
            DeconvolutionIterations,
            DeconvolutionNoise,
            DeconvolutionAdvanced,
            DeconvolutionDevices
        },
        data() {
            return {
                serie: series.formatSeries(null),
            }
        }
    }
</script>

<style lang="scss" scoped>
.review-card {
    height: 600px;
    
    .scroll-y {
        overflow-y: auto;
    }
}
</style>