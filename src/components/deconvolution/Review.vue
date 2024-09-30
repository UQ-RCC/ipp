<template>
    <div>
        <div v-show="false">

            <DeconvolutionMetadata ref="revdeconmetadata" />
            <DeconvolutionPsf ref="revdeconpsf" />
            <DeconvolutionDeskew ref="revdecondeskew" />
            <DeconvolutionIterations ref="revdeconiterations" />
            <DeconvolutionNoise ref="revdeconnoise" />
            <DeconvolutionAdvanced ref="revdeconadvanced" />
            <DeconvolutionDevices ref="revdecondevices" />
        </div>


        <h4> {{ estimatedTime }}</h4>
        <br/>
        <v-expansion-panels accordion >
            <v-expansion-panel @click="change(0)"  >
                <v-expansion-panel-header>Metadata</v-expansion-panel-header>
                <v-expansion-panel-content>
                    <!-- <deconvolution-metadata ref="revdeconmetadata" :readonly="true"/> -->
                    <DeconvolutionMetadata ref="revdeconmetadata" :readonly="true"/>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel @click="change(1)">
                <v-expansion-panel-header>PSF</v-expansion-panel-header>
                <v-expansion-panel-content>
                    <!-- <deconvolution-psf ref="revdeconpsf" :readonly="true"/> -->
                    <DeconvolutionPsf ref="revdeconpsf" :readonly="true"/>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel v-if="serie.psfType === 3" @click="change(2)">
                <v-expansion-panel-header>Deskew</v-expansion-panel-header>
                <v-expansion-panel-content>
                    <!-- <deconvolution-deskew ref="revdecondeskew" :readonly="true"/> -->
                    <DeconvolutionDeskew ref="revdecondeskew" :readonly="true"/>
                </v-expansion-panel-content>
            </v-expansion-panel>


            <v-expansion-panel @click="change(3)">
                <v-expansion-panel-header>Iterations</v-expansion-panel-header>
                <v-expansion-panel-content>
                    <!-- <deconvolution-iterations ref="revdeconiterations" :readonly="true"/> -->
                    <DeconvolutionIterations ref="revdeconiterations" :readonly="true"/>
                </v-expansion-panel-content>
            </v-expansion-panel>


            <v-expansion-panel v-if="api=='Microvolution'" @click="change(4)">
                <v-expansion-panel-header>Noise Suppression</v-expansion-panel-header>
                <v-expansion-panel-content>
                <!--  <deconvolution-noise ref="revdeconnoise" :readonly="true"/> -->
                    <DeconvolutionNoise ref="revdeconnoise" :readonly="true"/>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel v-if="api=='Microvolution'" @click="change(5)">
                <v-expansion-panel-header>Advanced</v-expansion-panel-header>
                <v-expansion-panel-content>
                    <!-- <deconvolution-advanced ref="revdeconadvanced" :readonly="true"/> -->
                    <DeconvolutionAdvanced ref="revdeconadvanced" :readonly="true"/>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel @click="change(6)">
                <v-expansion-panel-header>Devices</v-expansion-panel-header>
                <v-expansion-panel-content>
                    <!-- <deconvolution-devices ref="revdecondevices" :readonly="true"/> -->
                    <DeconvolutionDevices ref="revdecondevices" :readonly="true"/>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>




    </div>
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
    import PreferenceAPI from "@/api/PreferenceAPI"
    import DeconvolutionAPI from "@/api/DeconvolutionAPI.js"

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
                panelId: 0,
                serie: series.formatSeries(null),
                panel: this.$refs.revdeconmetadata,
                api:'',
                selectedtag: null,
                estimatedTime:null
            }
        }, 
        methods: {
            load_serie(serie){
                this.serie = serie
                this.change(this.panelId)
                this.getQueueTime()
            },
            change(panelId){
                
                this.panel = this.getPanel(panelId)
                if(this.panel ) {
                    this.panel.load_serie(this.serie)
                }
                    
            },
            getPanel(panelId) {
                let _panel = null
                switch(parseInt(panelId)) {
                    case 0:
                        _panel = this.$refs.revdeconmetadata
                        break
                    case 1:
                        _panel = this.$refs.revdeconpsf
                        break
                    case 2:
                        _panel = this.$refs.revdecondeskew
                        break
                    case 3:
                        _panel = this.$refs.revdeconiterations
                        break
                    case 4:
                        _panel = this.$refs.revdeconnoise
                        break
                    case 5:
                        _panel = this.$refs.revdeconadvanced
                        break
                    case 6:
                        _panel = this.$refs.revdecondevices
                        break
                }
                return _panel
            },

            async getQueueTime (){
                let response = await DeconvolutionAPI.queue_time(this.serie.instances,this.serie.mem,this.serie.gpus,'gpu_cuda')
    
                //let output = response.commandResult
            
                const responseString = response.commandResult[0].output
                const regex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
                const timeStampMatch = responseString.match(regex) 
                const startTime = timeStampMatch ? timeStampMatch[0]:null
                const queueTime = new Date(startTime)
                const timediffinms = queueTime - (new Date)
                const timediffinSec = Math.floor(timediffinms/1000)
                const timediffinmins = Math.floor(timediffinSec/60)
                console.log(timediffinSec)
                
                    
                if (timediffinSec < 60 ) {
                    this.estimatedTime = "This job is expected to start in less than 1 minute"
                }else if (timediffinSec > 60 &&  timediffinmins < 60){
                    this.estimatedTime = "This job is expected to start in about "+Math.ceil(timediffinmins)+" mins"
                }else if (timediffinmins > 60 ){
                    this.estimatedTime = "This job is expected to start in about "+Math.ceil((timediffinmins/60))+" hours"
                }
                    
            },

            // doing nothing anyway
            is_valid(){
                return true
            }

        },
        mounted: async function() {
            let _current_api = await PreferenceAPI.get_config()
            this.api=_current_api.apiname
            this.selectedtag = _current_api.metadatatag
            for (let i=0; i<7 ; i++){
                this.panel = this.getPanel(i)
                if(this.panel ) {
                    this.panel.load_serie(this.serie)
                }
            }
            this.getQueueTime()

        }

    }
</script>

<style lang="scss" scoped>
.review-card {
    max-height: 800px;
    
    .scroll-y {
        overflow-y: auto;
    }
}
</style>