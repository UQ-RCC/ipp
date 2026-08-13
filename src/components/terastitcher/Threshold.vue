<template>
    <v-card :disabled="readonly" >
        <file-browser-dialog ref="filedialog" />
        <v-row class="mt-2" v-if="serie.projectStatus!=='hidden'">
            <v-col cols="12">
                <v-alert 
                    v-if="serie.projectStatus === 'pending'" 
                    type="info"
                    text
                >
                     Project running on HPC... checking every 5s
                </v-alert>

                <v-alert 
                    v-if="serie.projectStatus === 'completed'" 
                    type="success"
                    text
                >
                     Project complete
                </v-alert>
            </v-col>
        </v-row>
          <v-row class="mt-2" v-if="serie.thrsStatus!=='hidden'">
            <v-col cols="12">
                <v-alert 
                    v-if="serie.thrsStatus === 'pending'" 
                    type="info"
                    text
                >
                     Threshold calculation running on Bunya... checking every 5s
                </v-alert>

                <v-alert 
                    v-if="serie.thrsStatus === 'completed'" 
                    type="success"
                    text
                >
                     Threshold calculation complete
                </v-alert>
            </v-col>
        </v-row>
        
        
        <v-row style="margin-top: 5px;">

            <v-slider
                v-model="serie.thrs_reliabilitythres"
                :max="1"
                :step="0"
                class="ma-4"
                label="Reliability threshold"
                hide-details
            >
                <template v-slot:append>
                <v-text-field
                    v-model="serie.thrs_reliabilitythres"
                    compact
                    style="width: 80px"
                    type="number"
                    outlined
                    hide-details
                ></v-text-field>
                </template>
            </v-slider>

        </v-row>
        <v-row>

      
            <v-col cols="6" sm="2" md="4">
                <v-text-field 
                    dense 
                    outlined  
                    label="Reliable displacements" 
                    v-model="serie.thrs_rlbdisplacements"
                >
                </v-text-field>
            </v-col>
                <v-col cols="6" sm="4" md="4">
                <v-text-field 
                    dense 
                    outlined  
                    label="Stitchable stacks" 
                    v-model="serie.thrs_stichstacks"
                >
                </v-text-field>
            </v-col>
                <v-col cols="6" sm="4" md="4">
                <v-text-field 
                    dense 
                    outlined  
                    label="Per-pair displacement" 
                    v-model="serie.thrs_ppdisplacement"
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
                            v-bind="attrs" v-on="on" @click.stop="compute_threshold()">
                                Threshold
                        </v-btn>
                    </template>
                    <span>Calculating Thresholds</span>
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
        name: 'TerastitcherThreshold',
        props: {
            readonly: { type: Boolean, default: false }, 
        },
        components: {
            FileBrowserDialog,
        },
        data() {
            return {
                serie: {},
                reliabilitythres:50,
                thrs_data:null,
                
            }
        },
        watch: {
            'serie.thrs_reliabilitythres': function(newVal) {
                if (!this.thrs_data) return 
                const { reliable, total, stitchables, n_stacks } = this.updateThresholdContents( this.thrs_data, newVal)
                let reliable_displacements = reliable +"/"+ total
                let stitchable_stacks = stitchables +"/"+ n_stacks
                this.serie.thrs_rlbdisplacements = reliable_displacements
                this.serie.thrs_stichstacks = stitchable_stacks
                this.serie.thrs_ppdisplacement = this.serie.project_ppdisplacements
            }
        },
        methods: {
            // return the data
            get_serie(){
                return this.serie
            },
            async load_serie(serie){
               // this.serie = serie
                this.serie = Object.assign({}, serie)
                Vue.set(this.serie, 'thrs_reliabilitythres', 0.75)
                if (this.serie.thrs_cal_data) {
                    this.thrs_data = this.serie.thrs_cal_data
                    const { reliable, total, stitchables, n_stacks } = this.updateThresholdContents(
                        this.thrs_data,
                        this.serie.thrs_reliabilitythres
                    )
                    let reliable_displacements = reliable +"/"+ total
                    let stitchable_stacks = stitchables +"/"+ n_stacks
                   /*  this.serie.thrs_rlbdisplacements = reliable_displacements
                    this.serie.thrs_stichstacks = stitchable_stacks
                    this.serie.thrs_ppdisplacement = this.serie.project_ppdisplacements */
                    Vue.set(this.serie, 'thrs_rlbdisplacements', reliable_displacements)
                    Vue.set(this.serie, 'thrs_stichstacks', stitchable_stacks)
                    Vue.set(this.serie, 'thrs_ppdisplacement', this.serie.project_ppdisplacements)
                }
                
            },

            updateThresholdContents(result, threshold) {
                let total = 0
                let reliable = 0
                for (const adj of result.adjacencies) {
                    total += 3
                    reliable += adj.rels.filter(r => r >= threshold).length
                }

                let stitchables = 0
                for (const stack of result.stack_directions){
                    const stitchable = stack.dirs.some(rels => rels.some(r => r >= threshold))
                    if (stitchable) {
                        stitchables++
                    }
                }

                let n_stacks = result.n_stacks

                return {reliable, total, stitchables, n_stacks}

            
        
            },

            async compute_threshold() {
                let thresholdData = {...this.serie}
                console.log("thresholdData")
                console.log(thresholdData)
                thresholdData.outputPath = this.serie.outputPath
                thresholdData.teraStep = "threshold"
                delete thresholdData.thrs_cal_data
                Vue.set(this.serie, 'thrsStatus', 'pending')

                Vue.notify({
                    group: 'datanotif',
                    type: 'info',
                    title: 'Threshold Calculation',
                    text: 'Submitted for Threshold Calculation. This may take a while...',
                    closeOnClick: true,
                    duration: 3000,
                })
                try {
                    const response = await TerastitcherAPI.submit_step(thresholdData, thresholdData.outputPath)
                    const output = response.commandResult[0].output
                    console.log("Threshold job response:", response.commandResult[0].output)
                    const match = output.match(/Submitted batch job (\d+)/)
                    if (!match) throw new Error("Could not parse job ID from: " + output)
                    const jobId = match[1]
                    console.log("SLURM job ID:", jobId)
                    this.serie.thrsJobId = jobId
                    Vue.set(this.serie, 'thrsStatus', 'pending')
                    this.startPolling(jobId, thresholdData.outputPath, 'threshold')
                }
                catch (error) {
                    console.error("Error occurred while submitting threshold step:", error)
                    Vue.notify({
                        group: 'datanotif',
                        type: 'error',
                        title: 'Threshold Calculation',
                        text: 'Failed to submit for threshold calculation.',
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
                        console.log("Threshold result response:", resultResp)
                        const resultRaw = resultResp.commandResult.map(item => item.output).join('')
                        console.log("Threshold result resultRaw:", resultRaw)

                        try {
                            const result = JSON.parse(resultRaw)
                            console.log("Parsed threshold result:", result)
                            if (result.status === "success") {
                                Vue.set(this.serie, 'thrsStatus', 'completed')

                                Vue.notify({
                                group: 'datanotif', type: 'success',
                                title: 'Threshold Complete',
                                text: `xml saved to ${result.output_xml}`,
                                closeOnClick: true, duration: 5000,
                                })
                            } else {
                                Vue.set(this.serie, 'thrsStatus', 'failed')
                                Vue.notify({
                                group: 'datanotif', type: 'error',
                                title: 'Threshold Failed',
                                text: result.error || 'Unknown error',
                                closeOnClick: true, duration: 8000,
                                })
                            }
                        } catch (parseErr) {
                        console.error("Could not parse result JSON:", resultRaw)
                        Vue.set(this.serie, 'thrsStatus', 'failed')
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