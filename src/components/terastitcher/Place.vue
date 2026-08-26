<template>
    <v-card :disabled="readonly" >
        <file-browser-dialog ref="filedialog" />
        <v-row class="mt-2" v-if="serie.thrsStatus!=='hidden'">
            <v-col cols="12">
                <v-alert 
                    v-if="serie.thrsStatus === 'pending'" 
                    type="info"
                    text
                >
                     Threshold running on Bunya... checking every 5s
                </v-alert>

                <v-alert 
                    v-if="serie.thrsStatus === 'completed'" 
                    type="success"
                    text
                >
                     Threshold step complete
                </v-alert>
            </v-col>
        </v-row>
        <v-row class="mt-2" v-if="serie.placeStatus!=='hidden'">
            <v-col cols="12">
                <v-alert 
                    v-if="serie.placeStatus === 'pending'" 
                    type="info"
                    text
                >
                     Placing running on HPC... checking every 5s
                </v-alert>

                <v-alert 
                    v-if="serie.placeStatus === 'completed'" 
                    type="success"
                    text
                >
                     Place step complete
                </v-alert>
            </v-col>
        </v-row>
        
        
        <v-row style="margin-top: 5px;">

         
            <v-col cols="8" sm="4" md="6">
                <v-select 
                    dense 
                    outlined  
                    label="Algorithm" 
                    item-text="label"
                    v-model="serie.place_algo"
                    :items="algorithm"
                >
                </v-select>
            </v-col>
                <v-col cols="8" sm="4" md="6">
                <v-text-field 
                    dense 
                    outlined  
                    label="Per-pair displacements" 
                    v-model="serie.place_ppdisplacement"
                    readonly
                >
                </v-text-field>
            </v-col>
            
        </v-row>
        <v-row>
             <v-col cols="5" sm="2" md="2">
                <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn 
                            color="primary" rounded dark default 
                            v-bind="attrs" v-on="on" @click.stop="compute_place">
                                Place
                        </v-btn>
                    </template>
                    <span>Placing</span>
                </v-tooltip>
               
            </v-col>
        </v-row>
        

    </v-card>

</template>

<script>
    import Vue from 'vue';
    //import series from "@/utils/series.js"
    // import PreferenceAPI from "@/api/PreferenceAPI"
    import FileBrowserDialog from '@/components/FileBrowserDialog.vue'
    import TerastitcherAPI from '../../api/TerastitcherAPI';
    
    export default {
        name: 'TerastitcherPlace',
        props: {
            readonly: { type: Boolean, default: false }, 
        },
        components: {
            FileBrowserDialog,
            
        },
        data() {
            return {
                serie: {},
                algorithm:[
                    {label:'Minimum Spanning Tree', value:1}
                ],
                
            }
        },
        methods: {
            // return the data
            get_serie(){
                return this.serie
            },
            async load_serie(serie){
                //this.serie = serie
                this.serie = Object.assign({}, serie)
                Vue.set(this.serie, 'place_algo', 1)
                Vue.set(this.serie, 'place_ppdisplacement', 1)
            },
            async compute_place() {
                let placeData = {}
                placeData = this.serie
                placeData.outputPath = this.serie.outputPath
                placeData.teraStep = "place"
                Vue.set(this.serie, 'thrsStatus', 'hidden') 
                Vue.set(this.serie, 'placeStatus', 'pending')
                console.log("Placing with data:", placeData)
                if (placeData.thrs_cal_data) {
                    delete placeData.thrs_cal_data
                }
                console.log("Placing with data:", placeData)
                Vue.notify({
                    group: 'datanotif',
                    type: 'info',
                    title: 'Placing',
                    text: 'Submitted for Placing. This may take a while...',
                    closeOnClick: true,
                    duration: 3000,
                })
                try{
                    const response = await TerastitcherAPI.submit_step(placeData, placeData.outputPath)
                    const output = response.commandResult[0].output
                    console.log("Place job response:", response.commandResult[0].output)
                    const match = output.match(/Submitted batch job (\d+)/)
                    if (!match) throw new Error("Could not parse job ID from: " + output)
                    const jobId = match[1]
                    console.log("SLURM job ID:", jobId)
                    this.serie.placeJobId = jobId
                    Vue.set(this.serie, 'placeStatus', 'pending')
                    this.startPolling(jobId, placeData.outputPath, 'place')

                }
                catch (error) {
                    console.error("Error occurred while submitting place step:", error)
                    Vue.notify({
                        group: 'datanotif',
                        type: 'error',
                        title: 'Placing',
                        text: 'Failed to submit for placing.',
                        closeOnClick: true,
                        duration: 3000,
                    })
                }
           
            },
            startPolling(jobId, outputPath, step) {
                this.pollInterval = setInterval(async () => {
                    try {
                    const response = await TerastitcherAPI.poll_step_status(jobId, outputPath)
                    const status = response.commandResult[0].output || ""

                    const slurmState = status.split('\n')[0].trim()  // PENDING, RUNNING, COMPLETED, FAILED, NOTFOUND
                    console.log("SLURM state:", slurmState)

                    const isDone = !["RUNNING"].includes(slurmState)
                    //const isDone = slurmState.startsWith("PROGRESS:") || ["COMPLETED", "FAILED", "NOTFOUND"].includes(slurmState)

                    if (isDone) {
                        clearInterval(this.pollInterval)

                        // Fetch result JSON written by python
                        const resultResp = await TerastitcherAPI.get_step_result(outputPath, step)
                        console.log("Place result response:", resultResp)
                        const resultRaw = resultResp.commandResult.map(item => item.output).join('')
                        console.log("Place result resultRaw:", resultRaw)

                        try {
                            const result = JSON.parse(resultRaw)
                            console.log("Parsed place result:", result)
                            if (result.status === "success") {
                                Vue.set(this.serie, 'placeStatus', 'completed')
                                Vue.set(this.serie, 'placedim_d', result.dim_d)
                                Vue.set(this.serie, 'placedim_h', result.dim_h)
                                Vue.set(this.serie, 'placedim_v', result.dim_v)

                                Vue.notify({
                                group: 'datanotif', type: 'success',
                                title: 'Place Complete',
                                text: `xml saved to ${result.output_xml}`,
                                closeOnClick: true, duration: 5000,
                                })
                            } else {
                                Vue.set(this.serie, 'placeStatus', 'failed')
                                Vue.notify({
                                group: 'datanotif', type: 'error',
                                title: 'Place Failed',
                                text: result.error || 'Unknown error',
                                closeOnClick: true, duration: 8000,
                                })
                            }
                        } catch (parseErr) {
                        console.error("Could not parse result JSON:", resultRaw)
                        Vue.set(this.serie, 'placeStatus', 'failed')
                        }
                    }
                    } catch (pollErr) {
                    console.warn("Poll error (non-fatal, retrying):", pollErr.message)
                    }
                }, 5000)  // poll every 5s
            },
        },
        beforeDestroy() {
            clearInterval(this.pollInterval)
        }

}
</script>

<style lang="scss" scoped>
</style>