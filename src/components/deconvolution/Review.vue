<template>
    <v-expansion-panels accordion @change="change" v-model="panel">
        <v-expansion-panel>
            <v-expansion-panel-header>Metadata</v-expansion-panel-header>
            <v-expansion-panel-content>
                <deconvolution-metadata ref="revdeconmetadata" :readonly="true"/>
            </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel>
            <v-expansion-panel-header>PSF</v-expansion-panel-header>
            <v-expansion-panel-content>
                <deconvolution-psf ref="revdeconpsf" :readonly="true"/>
            </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel v-if="serie.psfType === 3">
            <v-expansion-panel-header>Deskew</v-expansion-panel-header>
            <v-expansion-panel-content>
                <deconvolution-deskew ref="revdecondeskew" :readonly="true"/>
            </v-expansion-panel-content>
        </v-expansion-panel>


        <v-expansion-panel>
            <v-expansion-panel-header>Iterations</v-expansion-panel-header>
            <v-expansion-panel-content>
                <deconvolution-iterations ref="revdeconiterations" :readonly="true"/>
            </v-expansion-panel-content>
        </v-expansion-panel>


        <v-expansion-panel>
            <v-expansion-panel-header>Noise Suppression</v-expansion-panel-header>
            <v-expansion-panel-content>
                <deconvolution-noise ref="revdeconnoise" :readonly="true"/>
            </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel>
            <v-expansion-panel-header>Advanced</v-expansion-panel-header>
            <v-expansion-panel-content>
                <deconvolution-advanced ref="revdeconadvanced" :readonly="true"/>
            </v-expansion-panel-content>
        </v-expansion-panel>

        <v-expansion-panel>
            <v-expansion-panel-header>Devices</v-expansion-panel-header>
            <v-expansion-panel-content>
                <deconvolution-devices ref="revdecondevices" :readonly="true"/>
            </v-expansion-panel-content>
        </v-expansion-panel>

        <v-row align="center" justify="center">
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn  class="my-3" 
                            color="primary"
                            @click.stop="savetemplate()" 
                            rounded dark large 
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
                panel: 0,
                serie: series.formatSeries(null),
            }
        }, 
        methods: {
            load_serie(serie){
                this.serie = serie
                this.change()
            },
            change(){
                let _panel = this.getPanel(this.panel)
                if(_panel)  
                    _panel.load_serie(this.serie)
            },
            getPanel(panelId) {
                let _panel = null
                switch(parseInt(panelId)) {
                    case 1:
                        _panel = this.$refs.revdeconpsf
                        break
                    case 2:
                        _panel = this.$refs.revdeconpsf
                        break
                    case 3:
                        _panel = this.$refs.revdecondeskew
                        break
                    case 4:
                        _panel = this.$refs.revdeconiterations
                        break
                    case 5:
                        _panel = this.$refs.revdeconnoise
                        break
                    case 6:
                        _panel = this.$refs.revdeconadvanced
                        break
                    case 7:
                        _panel = this.$refs.revdecondevices
                        break
                }
                return _panel
            },

            savetemplate(){
                this.$emit("template-save");
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