<template>
    <v-card :disabled="readonly" >
        <!-- <v-overlay v-model="overlay">
            <v-row align="center" justify="center"><label >Pairwise displacement computation, Please wait..</label> </v-row>
            <v-row align="center" justify="center">
                <v-progress-circular
                color="primary"
                indeterminate
                size="55"
                ></v-progress-circular> 
                
            </v-row> 
        </v-overlay> -->
        <file-browser-dialog ref="filedialog" />
        <v-row class="mt-2" v-if="serie.alignStatus">
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

       
        
        <!-- <v-row style="margin-top: 5px;"> 

            <v-col cols="12" sm="4" md="6">
                <v-text-field dense outlined 
                    label="Save project XML to:" 
                    v-model="serie.dr"
                    
                    >
                </v-text-field>
            </v-col>
              <v-col cols="5" sm="2" md="2">
                <v-tooltip top>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn 
                                    class="mx-1" 
                                    color="primary" 
                                    @click.stop="chooseOutputFolder"
                                    rounded dark default 
                                    v-bind="attrs" v-on="on">
                                    Choose Output Folder
                                </v-btn>
           
                            </template>
                            <span>Select where to save the XML</span>
                        </v-tooltip>
               
            </v-col>
             
            
        </v-row> -->
        <v-row style="margin-top: 5px;">

            <v-col cols="4" sm="2" md="3">
                   <v-select dense
                       :items="algorithm"
                       v-model="serie.align_algo"
                       item-text="label"
                        item-value="value"
                       label="Algorithm"
                       outlined
                       return-object
                       >
                   </v-select>
               </v-col>
                <v-col cols="4" sm="2" md="3">
                <v-text-field 
                    dense 
                    outlined
                    type=number 
                    label="Number of slices per layer" 
                    v-model="serie.align_slicespl"
                    @input="updateMemoryOccupancy()"
                >
                </v-text-field>
            </v-col>
            <v-col cols="4" sm="2" md="3">
                   <v-select dense
                        :items="channel"
                        item-text="label"
                        item-value="value"
                        v-model="serie.align_channel"
                        label="Channel selection"
                        outlined
                        return-object
                       >
                   </v-select>
            </v-col>
            <v-col cols="4" sm="2" md="3">
                   <v-text-field 
                    dense 
                    outlined
                    type="number"
                    label="Estimated memory usage (MB)" 
                    v-model="serie.align_estmemory"
                >
                </v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-expansion-panels v-model="advancedPanel" accordion>
                <v-expansion-panel>
                    <v-expansion-panel-header>
                        <b>Advanced Options</b>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content >
                        <v-row>

                            <v-col cols="8" sm="4" md="6">
                               
                                <v-text-field
                                    dense
                                    outlined
                                    type="number"
                                    label="Data subset selection (rows) from"
                                    v-model="serie.align_subsetRowfrom"
                                    :max="serie.import_tilesRows - 1"
                                    :min="0"
                                    @input="updateMemoryOccupancy()"
                                >
                                </v-text-field>
                            </v-col>
                            <v-col cols="8" sm="4" md="6">
                                <v-text-field 
                                    dense 
                                    outlined
                                    type="number"
                                    label="Data subset selection(rows) to" 
                                    v-model="serie.align_subsetRowto"
                                    :max="serie.import_tilesRows - 1"
                                    :min="0"
                                    @input="updateMemoryOccupancy()"
                                >
                                </v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>

                            <v-col cols="8" sm="4" md="6">
                                <v-text-field 
                                    dense 
                                    outlined
                                    type="number"
                                    label="Data subset selection(columns) from" 
                                    v-model="serie.align_subsetColfrom"
                                    :max="serie.import_tilesCols - 1"
                                    :min="0"
                                     @input="updateMemoryOccupancy()"
                                >
                                </v-text-field>
                            </v-col>
                            <v-col cols="8" sm="4" md="6">
                                <v-text-field 
                                    dense 
                                    outlined
                                    type="number"
                                    label="Data subset selection(columns) to" 
                                    v-model="serie.align_subsetColto"
                                    :max="serie.import_tilesCols - 1"
                                    :min="0"
                                     @input="updateMemoryOccupancy()"
                                >
                                </v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>

                            <v-col cols="8" sm="4" md="6">
                                <v-text-field 
                                    dense 
                                    outlined
                                    type="number"
                                    label="Data subset selection(slices) from" 
                                    v-model="serie.align_subsetSlifrom"
                                    :max="serie.import_n_slices - 1"
                                    :min="0"
                                >
                                </v-text-field>
                            </v-col>
                            <v-col cols="8" sm="4" md="6">
                                <v-text-field 
                                    dense 
                                    outlined
                                    type=number
                                    label="Data subset selection(slices) to" 
                                    v-model="serie.align_subsetSlito"
                                    :max="serie.import_n_slices - 1"
                                    :min="0"
                                >
                                </v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>

                            <v-col cols="6" sm="2" md="4">
                                <v-text-field 
                                    dense 
                                    outlined
                                    type=number
                                    label="Search Region (voxels) X" 
                                    v-model="serie.align_searchX"
                                    :min="0"
                                >
                                </v-text-field>
                            </v-col>
                            <v-col cols="6" sm="2" md="4">
                                <v-text-field 
                                    dense 
                                    outlined
                                    type=number
                                    label="Search Region (voxels) Y" 
                                    v-model="serie.align_searchY"
                                    :min="0"
                                >
                                </v-text-field>
                            </v-col>
                            <v-col cols="6" sm="2" md="4">
                                <v-text-field 
                                    dense 
                                    outlined
                                    type=number
                                    label="Search Region (voxels) Z" 
                                    v-model="serie.align_searchZ"
                                    :min="0"
                                >
                                </v-text-field>
                            </v-col>
                        </v-row>
                        <v-row>

                            <v-col cols="4" sm="4" md="6">
                                <v-text-field 
                                    dense 
                                    outlined
                                    type=number
                                    label="Overlap (voxels) X" 
                                    v-model="serie.align_overlapX"
                                >
                                </v-text-field>
                            </v-col>
                            <v-col cols="4" sm="4" md="6">
                                <v-text-field 
                                    dense 
                                    outlined
                                    type=number
                                    label="Overlap (voxels) Y" 
                                    v-model="serie.align_overlapY"
                                >
                                </v-text-field>
                            </v-col>
                           
                        </v-row>
                        <v-row>
                            <v-col>
                                <p>SPIM artifacts removal:</p>
                          
                                <v-checkbox label="Compute stacks profiles to be used in the Merging titles step" v-model="serie.align_spim" ></v-checkbox>

                            </v-col>
                                

                        </v-row>

                    </v-expansion-panel-content>
                </v-expansion-panel>
                
            </v-expansion-panels>
        </v-row>
        <v-row>
             <v-col cols="5" sm="2" md="2">
                <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn 
                            color="primary" rounded dark default 
                            v-bind="attrs" v-on="on" @click.stop="compute_alignment">
                                Align
                        </v-btn>
                    </template>
                    <span>Pairwise displacement computation</span>
                </v-tooltip>
               
            </v-col>
            <v-col cols="auto" class="align-self-center">
                <v-checkbox
                    v-model="serie.align_email" class="mt-0"
                    label="Send email notification when alignment is complete"
                    hide-details
                    dense
                ></v-checkbox>
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
        name: 'TerastitcherAlign',
        props: {
            readonly: { type: Boolean, default: false }, 
        },
        components: {
            FileBrowserDialog,
        },
        data() {
            return {
                serie: {},
                outputBasePath: '',
                outputFolderName: '',
                origionalSerie: {}, 
                metadataValuesRules: [
                    value => value && value > 0 || 'Must be a positive number'
                ], 
                algorithm:['MIPNCC', 'PC'],
                slicespl:1,
                channel:[ 'all', 'R', 'B' ,'G'],
                align_estmemory:65.6523,
                advancedPanel: null,
                overlay:false,
                pollInterval: null
                //alignJobId : null,
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
                //define defaults
                //this.serie = serie
                this.serie = Object.assign({}, serie)
                console.log("serie in align")
                console.log(this.serie)
               //Vue.set(this.serie, 'alignStatus', null)
                Vue.set(this.serie, 'align_algo', 'MIPNCC')
                Vue.set(this.serie, 'align_channel', 'all')
                Vue.set(this.serie, 'align_slicespl', Math.min(100, this.serie.import_n_slices))
                Vue.set(this.serie, 'align_spim', false)
                Vue.set(this.serie, 'align_subsetRowfrom', 0)
                Vue.set(this.serie, 'align_subsetRowto', this.serie.import_tilesRows - 1)
                Vue.set(this.serie, 'align_subsetColfrom', 0)
                Vue.set(this.serie, 'align_subsetColto', this.serie.import_tilesCols - 1)
                Vue.set(this.serie, 'align_subsetSlifrom', 0)
                Vue.set(this.serie, 'align_subsetSlito', this.serie.import_n_slices - 1)
                Vue.set(this.serie, 'align_searchX', 25)
                Vue.set(this.serie, 'align_searchY', 25)
                Vue.set(this.serie, 'align_searchZ', 25)
                Vue.set(this.serie, 'align_overlapX', this.serie.import_tileoverlapX)
                Vue.set(this.serie, 'align_overlapY', this.serie.import_tileoverlapY)
                Vue.set(this.serie, 'align_estmemory', 0)
                /* this.$set(this.serie, 'align_overlapY', this.serie.import_tileoverlapY)
                this.$set(this.serie, 'align_estmemory', 0)  */ 
                this.updateMemoryOccupancy()
                console.log(this.serie.align_estmemory)
                console.log(this.serie.alignStatus)
                
                
            },
            
    
            openAdvanced () {
                this.$nextTick(() => {
                    this.advancedPanel = 0
                })
            },
            updateMemoryOccupancy(){
                let nstack_at_time = Math.min((this.serie.align_subsetRowto - this.serie.align_subsetRowfrom), (this.serie.align_subsetColto - this.serie.align_subsetColfrom) ) +2
                console.log(nstack_at_time)
                let MBytes = nstack_at_time * this.serie.align_slicespl * (this.serie.import_tiledimX/1024.0) * (this.serie.import_tiledimY/1024.0) *4
                this.serie.align_estmemory = MBytes.toFixed(3)
                console.log(MBytes)
                //return MBytes
                
            },
            async compute_alignment(){

                let alignData = {}
                alignData = this.serie
                alignData.teraStep = "align"
                Vue.set(this.serie, 'alignStatus', 'pending')
                Vue.set(this.serie, 'projectStatus', 'hidden') // hide project status when starting alignment, will be shown again after alignment completion
                
                console.log("alignData")
                console.log(alignData)

                /* this.$set(this.serie, 'project_displacements', 100)
                        this.$set(this.serie, 'ppdisplacements', 100) */

                Vue.notify({
                    group: 'datanotif',
                    type: 'info',
                    title: 'Computation',
                    text: 'Submitted for Pairwise Displacement Computation',
                    closeOnClick: true,
                    duration: 3000,
                })
                try{
                    const response = await TerastitcherAPI.submit_step(alignData, alignData.outputPath)
                    const output = response.commandResult[0].output
                    //console.log("Job submitted, HPC job ID:", jobId)
                    console.log("Alignment job response:", response.commandResult[0].output)

                    const match = output.match(/Submitted batch job (\d+)/)
                    if (!match) throw new Error("Could not parse job ID from: " + output)
    
                    const jobId = match[1]
                    console.log("SLURM job ID:", jobId)
                    this.serie.alignJobId = jobId
                    //this.serie.alignStatus = 'pending'
                    Vue.set(this.serie, 'alignStatus', 'pending')
                    this.startPolling(jobId, alignData.outputPath, 'align')

                } catch(err){
                    console.error("Error submitting alignment job:", err)
                    Vue.notify({
                        group: 'datanotif',
                        type: 'error',
                        title: 'Submission Failed',
                        text: 'Failed to submit alignment job. Please try again.',
                        closeOnClick: true,
                        duration: 5000,
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
                        console.log("Alignment result response:", resultResp)
                        const resultRaw = resultResp.commandResult.map(item => item.output).join('')
                        console.log("Alignment result resultRaw:", resultRaw)

                        try {
                            const result = JSON.parse(resultRaw)
                            console.log("Parsed alignment result:", result)
                            if (result.status === "success") {
                                //this.serie.alignStatus = 'completed'
                                Vue.set(this.serie, 'alignStatus', 'completed')
                                Vue.set(this.serie, 'project_displacements', result.displacement_total)
                                Vue.set(this.serie, 'project_ppdisplacements', result.displacement_per_stack_pair)
                                Vue.notify({
                                group: 'datanotif', type: 'success',
                                title: 'Alignment Complete',
                                text: `Displacements: ${result.displacement_total} total`,
                                closeOnClick: true, duration: 5000,
                                })
                                
                            } else {
                                Vue.set(this.serie, 'alignStatus', 'failed')
                                Vue.notify({
                                group: 'datanotif', type: 'error',
                                title: 'Alignment Failed',
                                text: result.error || 'Unknown error',
                                closeOnClick: true, duration: 8000,
                                })
                            }
                        } catch (parseErr) {
                        console.error("Could not parse result JSON:", resultRaw)
                        Vue.set(this.serie, 'alignStatus', 'failed')
                        }
                    }
                    } catch (pollErr) {
                    console.warn("Poll error (non-fatal, retrying):", pollErr.message)
                    }
                }, 60000)  // poll every 10s
            }
    
        },
        beforeDestroy() {
            clearInterval(this.pollInterval)
        }
    }
</script>

<style lang="scss" scoped>
</style>