<template>
    <v-card :disabled="readonly" >
        <file-browser-dialog ref="filedialog" />
        <div style="display: none">
            <Align ref="alignComponent" />
        </div>

        <v-row class="mt-2" v-if="serie.alignStatus!=='hidden'">
            <v-col cols="12">
                <v-alert 
                    v-if="serie.alignStatus === 'pending'" 
                    type="info"
                    text
                >
                        Alignment running on Bunya... checking every 60s
                </v-alert>

                <v-alert 
                    v-if="serie.alignStatus === 'completed'" 
                    type="success"
                    text
                >
                     Alignment complete
                </v-alert>
            </v-col>
        </v-row>
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
        
        <v-row class="mt-2">

         
            <v-col cols="8" sm="4" md="6">
                <v-text-field 
                    dense 
                    outlined  
                    type="number"
                    label="Displacements" 
                    v-model="serie.project_displacements"
                    readonly
                >
                </v-text-field>
            </v-col>
                <v-col cols="8" sm="4" md="6">
                <v-text-field 
                    dense 
                    outlined  
                    type="number"
                    label="Per-pair displacements" 
                    v-model="serie.project_ppdisplacements"
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
                            v-bind="attrs" v-on="on" @click.stop="compute_project">
                                Project
                        </v-btn>
                    </template>
                    <span>Projecting</span>
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
    //import Align from './Align.vue';
    import TerastitcherAPI from '../../api/TerastitcherAPI';
    
    export default {
        name: 'TerastitcherProject',
        props: {
            readonly: { type: Boolean, default: false }, 
        },
        components: {
            FileBrowserDialog,
            
        },
        data() {
            return {
                serie: {},
                pollInterval: null,
                outputBasePath: '',
                outputFolderName: '',
                origionalSerie: {}, 
                //alignStatus: 'pending',
                //displacementTotal: 0,
            }
        },
        methods: {
            // return the data
            get_serie(){
                return this.serie
            },
            async load_serie(serie){
                this.serie = Object.assign({}, serie)
                console.log("project serie")
                console.log(serie)
                console.log( this.serie )
                //Vue.set(this.serie, 'projectStatus', null)
                //this.$refs.alignComponent.startPolling(this.serie.outputPath)
                //this.serie.alignStatus = 'pending'
                //this.serie.project_displacements = 0
                //this.serie.project_ppdisplacements = 0
               // this.alignStatus = 'pending'
                //this.displacementTotal = 0
            },
            async compute_project() {
                // Remove thrs_cal
                let projectData = {}
                projectData = this.serie
                projectData.outputPath = this.serie.outputPath
                projectData.teraStep = "project"
                Vue.set(this.serie, 'alignStatus', 'hidden') // hide alignment status after completion, since project status will be shown next
                Vue.set(this.serie, 'projectStatus', 'pending')
                console.log("Projecting with data:", projectData)

                Vue.notify({
                    group: 'datanotif',
                    type: 'info',
                    title: 'Projecting',
                    text: 'Submitted for Projection. This may take a while...',
                    closeOnClick: true,
                    duration: 3000,
                })
                try{
                    const response = await TerastitcherAPI.submit_step(projectData, projectData.outputPath)
                    const output = response.commandResult[0].output
                    console.log("Project job response:", response.commandResult[0].output)
                    const match = output.match(/Submitted batch job (\d+)/)
                    if (!match) throw new Error("Could not parse job ID from: " + output)
                    const jobId = match[1]
                    console.log("SLURM job ID:", jobId)
                    this.serie.projectJobId = jobId
                    Vue.set(this.serie, 'projectStatus', 'pending')
                    this.startPolling(jobId, projectData.outputPath, 'project')

                }
                catch (error) {
                    console.error("Error occurred while submitting project step:", error)
                    Vue.notify({
                        group: 'datanotif',
                        type: 'error',
                        title: 'Projecting',
                        text: 'Failed to submit for projection.',
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
                        console.log("Project result response:", resultResp)
                        const resultRaw = resultResp.commandResult.map(item => item.output).join('')
                        console.log("Project result resultRaw:", resultRaw)

                        try {
                            const result = JSON.parse(resultRaw)
                            console.log("Parsed project result:", result)
                            if (result.status === "success") {
                                //this.serie.projectStatus = 'completed'
                                //this.serie.thrs_cal_data = result
                                Vue.set(this.serie, 'thrs_cal_data', result)
                                Vue.set(this.serie, 'projectStatus', 'completed')
                                const { reliable, total, stitchables, n_stacks } = this.updateThresholdContents(result, this.serie.thrs_reliabilitythres)

                                let reliable_displacements = reliable +"/"+ total
                                let stitchable_stacks = stitchables +"/"+ n_stacks
                                /* this.serie.thrs_rlbdisplacements = reliable_displacements
                                this.serie.thrs_stichstacks = stitchable_stacks
                                this.serie.thrs_ppdisplacement = this.serie.project_ppdisplacements */
                                 Vue.set(this.serie, 'thrs_rlbdisplacements', reliable_displacements)
                                 Vue.set(this.serie, 'thrs_stitchstacks', stitchable_stacks)
                                 Vue.set(this.serie, 'thrs_ppdisplacement', this.serie.project_ppdisplacements)

                                Vue.notify({
                                group: 'datanotif', type: 'success',
                                title: 'Project Complete',
                                text: `xml saved to ${result.output_xml}`,
                                closeOnClick: true, duration: 5000,
                                })
                            } else {
                                Vue.set(this.serie, 'projectStatus', 'failed')
                                Vue.notify({
                                group: 'datanotif', type: 'error',
                                title: 'Project Failed',
                                text: result.error || 'Unknown error',
                                closeOnClick: true, duration: 8000,
                                })
                            }
                        } catch (parseErr) {
                        console.error("Could not parse result JSON:", resultRaw)
                        Vue.set(this.serie, 'projectStatus', 'failed')
                        }
                    }
                    } catch (pollErr) {
                    console.warn("Poll error (non-fatal, retrying):", pollErr.message)
                    }
                }, 5000)  // poll every 5s
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
            
        },
         beforeDestroy() {
            clearInterval(this.pollInterval)
        }
    }
</script>

<style lang="scss" scoped>
</style>