<template>
    <div>
      <!--   <div v-show="false">

            <TerastitcherImport ref="teraimport" />
            <TerastitcherAlign ref="teraalign" />
            <TerastitcherProject ref="teraproject" />
            <TerastitcherThreshold ref="terathreshold" />
            <TerastitcherPlace ref="teraplace" />
            <TerastitcherMerge ref="teramerge" />
            <TerastitcherDevices ref="teradevices" />
        </div> -->


       
        <br/>
        <v-expansion-panels accordion v-model="activePanel">
            <v-expansion-panel   >
                <v-expansion-panel-header>Import</v-expansion-panel-header>
                <v-expansion-panel-content>
                    <TerastitcherImport v-if="activePanel === 0" ref="teraimport" :readonly="true"/>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel >
                <v-expansion-panel-header>Align</v-expansion-panel-header>
                <v-expansion-panel-content>
                    <!-- <deconvolution-psf ref="revdeconpsf" :readonly="true"/> -->
                    <TerastitcherAlign v-if="activePanel === 1" ref="teraalign" :readonly="true"/>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
                <v-expansion-panel-header>Project</v-expansion-panel-header>
                <v-expansion-panel-content>
                    <!-- <deconvolution-deskew ref="revdecondeskew" :readonly="true"/> -->
                    <TerastitcherProject v-if="activePanel === 2" ref="teraproject" :readonly="true"/>
                </v-expansion-panel-content>
            </v-expansion-panel>


            <v-expansion-panel>
                <v-expansion-panel-header>Threshold</v-expansion-panel-header>
                <v-expansion-panel-content>
                    <!-- <deconvolution-iterations ref="revdeconiterations" :readonly="true"/> -->
                    <TerastitcherThreshold v-if="activePanel === 3" ref="terathreshold" :readonly="true"/>
                </v-expansion-panel-content>
            </v-expansion-panel>


            <v-expansion-panel>
                <v-expansion-panel-header>Place</v-expansion-panel-header>
                <v-expansion-panel-content>
                <!--  <deconvolution-noise ref="revdeconnoise" :readonly="true"/> -->
                    <TerastitcherPlace v-if="activePanel === 4" ref="teraplace" :readonly="true"/>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
                <v-expansion-panel-header>Merge</v-expansion-panel-header>
                <v-expansion-panel-content>
                    <!-- <deconvolution-advanced ref="revdeconadvanced" :readonly="true"/> -->
                    <TerastitcherMerge v-if="activePanel === 5" ref="teramerge" :readonly="true"/>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel >
                <v-expansion-panel-header>Devices</v-expansion-panel-header>
                <v-expansion-panel-content>
                    <!-- <deconvolution-devices ref="revdecondevices" :readonly="true"/> -->
                    <TerastitcherDevices v-if="activePanel === 6" ref="teradevices" :readonly="true"/>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>




    </div>
</template>

<script>
    // import Vue from 'vue'
    import TerastitcherImport from '@/components/terastitcher/Import.vue'
    import TerastitcherAlign from '@/components/terastitcher/Align.vue'
    import TerastitcherProject from '@/components/terastitcher/Project.vue'
    import TerastitcherThreshold from '@/components/terastitcher/Threshold.vue'
    import TerastitcherPlace from '@/components/terastitcher/Place.vue'
    import TerastitcherMerge from '@/components/terastitcher/Merge.vue'
    import TerastitcherDevices from '@/components/terastitcher/Devices.vue'

    /* import series from "@/utils/series.js";
    import PreferenceAPI from "@/api/PreferenceAPI" */
   // import DeconvolutionAPI from "@/api/DeconvolutionAPI.js"

    export default {
        name: 'TerastitcherReview',
        components: {
            TerastitcherImport,
            TerastitcherAlign,
            TerastitcherProject,
            TerastitcherThreshold,
            TerastitcherPlace,
            TerastitcherMerge,
            TerastitcherDevices
        },
        data() {
            return {
                activePanel: null,
                serie: {},
                subText:null
            }
        }, 
         watch: {
            activePanel (index) {
            this.$nextTick(() => {
                const panel = this.getPanelRef(index)
                if (panel && this.serie) {
                    panel.load_serie(this.serie)
                }
                if (index === 1 && this.$refs.teraalign) {
                    this.$refs.teraalign.openAdvanced()
                }
                if (index === 5 && this.$refs.teramerge){
                    this.$refs.teramerge.openAdvanced()
                }
            })
            }
        },
        methods: {
            load_serie(serie){
                this.serie = serie
                //this.change(this.panelId)
                //this.getQueueTime()
            },
            /* change(panelId){
                
                this.panel = this.getPanel(panelId)
                if(this.panel ) {
                    this.panel.load_serie(this.serie)
                }
                    
            }, */
            getPanelRef (index) {
                const refs = [
                    this.$refs.teraimport,
                    this.$refs.teraalign,
                    this.$refs.teraproject,
                    this.$refs.terathreshold,
                    this.$refs.teraplace,
                    this.$refs.teramerge,
                    this.$refs.teradevices
                ]
                return refs[index] || null
                },
           /*  getPanel(panelId) {
                let _panel = null
                switch(parseInt(panelId)) {
                    case 0:
                        _panel = this.$refs.teraimport
                        break
                    case 1:
                        _panel = this.$refs.teraalign
                        break
                    case 2:
                        _panel = this.$refs.teraproject
                        break
                    case 3:
                        _panel = this.$refs.terathreshold
                        break
                    case 4:
                        _panel = this.$refs.teraplace
                        break
                    case 5:
                        _panel = this.$refs.teramerge
                        break
                    case 6:
                        _panel = this.$refs.teradevices
                        break
                }
                return _panel
            }, */

          /*   async getQueueTime (){
                let response = await DeconvolutionAPI.queue_time(this.serie.instances,this.serie.mem,this.serie.gpus,'gpu_cuda','gpu')
                
                
                //let output = response.commandResult
                
                const responseString = response.commandResult[0].output
                
                const regex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
                const timeStampMatch = responseString.match(regex) 
                const startTime = timeStampMatch ? timeStampMatch[0]:null
                const queueTime = new Date(startTime)
                const timediffinms = queueTime - (new Date)
                const timediffinSec = Math.floor(timediffinms/1000)
                //const timediffinmins = Math.floor(timediffinSec/60)
               this.subText="(Estimate may vary significantly from actual start as it is based on requested wall times for running and queued jobs)"
               
                
                    
                if (timediffinSec < 60 ) {
                    this.estimatedTime = "This job is expected to start in less than 1 minute"
                }else if (timediffinSec >= 60 &&  timediffinSec < 3600){
                    this.estimatedTime = "This job is expected to start in about "+Math.ceil(timediffinSec/60)+" mins."
                }else if (timediffinSec >= 3600 && timediffinSec < 86400){
                    this.estimatedTime = "This job is expected to start in about "+Math.ceil((timediffinSec/3600))+" hours. "
                }else if (timediffinSec >= 86400) {
                    this.estimatedTime = "This job is expected to start in about "+Math.ceil((timediffinSec/86400))+" days. "

                }
                    
            }, */

            // doing nothing anyway
            is_valid(){
                return true
            }

        },
        mounted: async function() {
           /*  let _current_api = await PreferenceAPI.get_config()
            this.api=_current_api.apiname
            this.selectedtag = _current_api.metadatatag */
            /* for (let i=0; i<7 ; i++){
                this.panel = this.getPanel(i)
                if(this.panel ) {
                    this.panel.load_serie(this.serie)
                }
            } */
            //this.getQueueTime()

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