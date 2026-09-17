<template>
    <v-card>
        
            <v-row align="center" no-gutters  dense>
                <v-col cols="6" sm="4" md="4" lg="4">
                    <span class="font-weight-medium">Dataset Size</span>
                </v-col>
                <v-col cols="6" sm="4" md="4" lg="4">
                    <v-radio-group v-model="serie.qos" row> 
                      
                        <v-tooltip top>
                            <template v-slot:activator="{ on, attrs }">
                                <v-radio
                                    v-bind="attrs"
                                    v-on="on"
                                    label="Small"
                                    value="debug"
                                ></v-radio>
                            </template>
                            <span>Small datasets, quick runs — max 1 hour walltime, higher priority</span>
                        </v-tooltip>

                        <v-tooltip top>
                            <template v-slot:activator="{ on, attrs }">
                                <v-radio
                                    v-bind="attrs"
                                    v-on="on"
                                    label="Large"
                                    value="normal"
                                ></v-radio>
                            </template>
                            <span>Larger datasets, standard runs — up to 2 weeks walltime</span>
                        </v-tooltip>
                    </v-radio-group> 
                                        
                </v-col>
            
            </v-row>
            <v-row align="center" no-gutters dense>
                <v-col cols="6" sm="4" md="4" lg="4">
                    <span class="font-weight-medium">Volume folder format</span>
                </v-col>
                <v-col cols="6" sm="4" md="4" lg="4">
                    <v-radio-group v-model="serie.setup_volformat" row> 
                        
                        <v-radio
                            label="Unstructured"
                            value="unstructured"
                        ></v-radio>
                        <v-radio
                            label="Structured"
                            value="structured"
                        ></v-radio>
                    </v-radio-group> 
                                        
                </v-col>
            
            </v-row>
             <v-alert
                v-if="serie.setup_volformat === 'structured'"
                icon="mdi-information-outline"
                outlined
                density="compact"
                class="mb-4"
            >
                You can directly import your volume into TeraStitcher if tiles are organized in <a
    href="https://github.com/abria/TeraStitcher/wiki/Supported-volume-formats#two-level-hierarchy-of-folders"
    target="_blank"
    rel="noopener noreferrer"
>
    two-level hierarchy of folders
</a>. Proceed to the next step. Otherwise, select "Unstructured" and provide the required information below to generate a descriptor file for your volume.
            </v-alert>
            
             <div v-if="serie.setup_volformat === 'unstructured'">
                <p class="font-weight-medium ">Move to two-level hierarchy folder structure</p>
                <p class="text-caption text-medium-emphasis"> The structured folder will be saved to {{ serie.volumePath }} with each channel stored in a separate folder.</p>
                
                    <v-row dense class="mb-2">
                        <v-col cols="6" sm="3">
                            <v-text-field dense outlined label="X" v-model="serie.setup_x" />
                        </v-col>
                        <v-col cols="6" sm="3">
                            <v-text-field dense outlined label="Y" v-model="serie.setup_y" />
                        </v-col>
                    </v-row>
                    <v-row  class="d-flex align-center mb-2">
                        
                        <v-col>

                            <span class="text-subtitle-1 font-weight-medium mr-2">Arrangement type</span>
                                <a href="https://your-docs-site/arrangement-types" target="_blank" class="text-caption">
                                    <v-icon small class="mr-1">mdi-help-circle-outline</v-icon>Unsure what this means?
                                </a>
                            <p class="text-caption text-medium-emphasis mb-2">
                                Choose your scan pattern.
                            </p>
                        </v-col>
                        

                    </v-row>

                    <v-item-group v-model="serie.setup_arrangement_type" mandatory>
                        <v-row>
                            <v-col
                                v-for="type in arrangementTypes"
                                :key="type.value"
                                cols="6" sm="3"
                            >
                                <v-item v-slot="{ active, toggle }" :value="type.value">
                                    <v-card
                                        :outlined="!active"
                                        :elevation="active ? 4 : 0"
                                        :color="active ? 'blue lighten-5' : ''"
                                        class="pa-2 text-center"
                                        style="cursor: pointer; border: 2px solid;"
                                        :style="{ borderColor: active ? '#1976d2' : '#e0e0e0' }"
                                        @click="toggle"
                                    >
                                        <!-- <div class="font-weight-bold mb-1">{{ type.label }}</div> -->
                                        <v-img :src="type.image" contain height="140"></v-img>
                                        <v-icon v-if="active" color="primary" class="mt-1">mdi-check-circle</v-icon>
                                    </v-card>
                                </v-item>
                            </v-col>
                        </v-row>
                    </v-item-group>

                    <v-btn class="mt-2" block color="primary" @click="generateDescriptor">
                        Move to two-level hierarchy folder structure
                    </v-btn>

                    <v-row class="mt-2" v-if="serie.setupStatus">
                        <v-col cols="12">
                            <v-alert v-if="serie.setupStatus === 'pending'" type="info" text>
                                Moving to folder structure... checking every 5s
                            </v-alert>
                            <v-alert v-if="serie.setupStatus === 'completed'" type="success" text>
                                Move complete — {{ (serie.setup_channels || []).length }} channel folder(s) found
                            </v-alert>
                            <v-alert v-if="serie.setupStatus === 'failed'" type="error" text>
                                Setup failed
                            </v-alert>
                        </v-col>
                    </v-row>
                </div>

    </v-card>
</template>

<script>
    import Vue from 'vue';
    import TerastitcherAPI from '../../api/TerastitcherAPI';

    export default {
        name: 'TerastitcherSetup',
        props: {
            readonly: { type: Boolean, default: false },
        },
        data() {
            return {
                serie: {},
                arrangementTypes: [
                    { label: 'Type 1', value: 1, image: require('../../../public/images/terastitcher/type1.png') },
                    { label: 'Type 2', value: 2, image: require('../../../public/images/terastitcher/type2.png') },
                    { label: 'Type 3', value: 3, image: require('../../../public/images/terastitcher/type3.png') },
                    { label: 'Type 4', value: 4, image: require('../../../public/images/terastitcher/type4.png') },
                    { label: 'Type 5', value: 5, image: require('../../../public/images/terastitcher/type5.png') },
                    { label: 'Type 6', value: 6, image: require('../../../public/images/terastitcher/type6.png') },
                    { label: 'Type 7', value: 7, image: require('../../../public/images/terastitcher/type7.png') },
                    { label: 'Type 8', value: 8, image: require('../../../public/images/terastitcher/type8.png') },
            // ...
        ]
            }
        },
        methods: {
            get_serie() {
                return this.serie
            },

            async load_serie(serie) {
                const source = serie?.setting != null ? serie.setting : serie
                this.serie = Object.assign({},source)
                console.log("load_serie setup", this.serie)
                /* const source = serie?.setting || serie || {}

                this.serie = Object.assign({
                    volformat: 'unstructured',
                    format_x: null,
                    format_y: null,
                    arrangement_type: null,
                }, source) */
            },
            selectArrangementType(n) {
                Vue.set(this.serie, 'setup_arrangement_type', n)
                console.log("arrangement type", this.serie.setup_arrangement_type)
            },
            async generateDescriptor() {
                let setupData ={}
                setupData = this.serie
                setupData.teraStep = 'setup'

                Vue.notify({
                    group: 'datanotif',
                    type: 'info',
                    title: 'Folder structure',
                    text: 'Move to two-level hierarchy folder structure',
                    closeOnClick: true,
                    duration: 3000,
                })
                try{
                   const response =  await TerastitcherAPI.submit_step(setupData, setupData.outputPath)
                    const output = response.commandResult[0].output
                    console.log("setup job response:",output) 
                    console.log("setup job data:",setupData)

                    const match = output.match(/Submitted batch job (\d+)/)
                    if (!match) throw new Error("Could not parse job ID from: " + output)
                    const jobId = match[1]
                    console.log("SLURM job ID:", jobId)
                    this.serie.setupJobId = jobId
                    Vue.set(this.serie, 'setupStatus', 'pending')
                    Vue.set(this.serie, 'importStatus', 'hidden')
                    this.startPolling(jobId, setupData.outputPath, 'setup')
                    
                } catch(err){
                    console.error("Error submitting setup job:", err)
                    Vue.notify({
                        group: 'datanotif',
                        type: 'error',
                        title: 'Submission Failed',
                        text: 'Failed to submit setup job. Please try again.',
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

                    //const isDone = !["RUNNING","PENDING"].includes(slurmState)
                    const isDone =  ["COMPLETED", "FAILED", "CANCELLED","TIMEOUT","NODE_FAIL", "OUT_OF_MEMORY"].includes(slurmState) 
                    
                    //const isDone = slurmState.startsWith("PROGRESS:") || ["COMPLETED", "FAILED", "NOTFOUND"].includes(slurmState)

                    if (isDone) {
                        clearInterval(this.pollInterval)

                        // Fetch result JSON written by python
                        const resultResp = await TerastitcherAPI.get_step_result(outputPath, step)
                        console.log("Setup result response:", resultResp)
                        const resultRaw = resultResp.commandResult.map(item => item.output).join('')
                        console.log("Setup result resultRaw:", resultRaw)

                        try {
                            const result = JSON.parse(resultRaw)
                            console.log("Parsed setup result:", result)
                            if (result.status === "success") {
                                let channels = result.channels || []

                                //this.serie.alignStatus = 'completed'
                                Vue.set(this.serie, 'setupStatus', 'completed')
                                Vue.set(this.serie, "setup_channels", channels)
                                Vue.set(this.serie, "setup_target", result.target)
                                Vue.notify({
                                group: 'datanotif', type: 'success',
                                title: 'Setup Complete',
                                text: `Channels: ${channels.length}`,
                                closeOnClick: true, duration: 5000,
                                })
                                
                            } else {
                                Vue.set(this.serie, 'setupStatus', 'failed')
                                Vue.notify({
                                group: 'datanotif', type: 'error',
                                title: 'Setup Failed',
                                text: result.error || 'Unknown error',
                                closeOnClick: true, duration: 8000,
                                })
                            }
                        } catch (parseErr) {
                            console.error("Could not parse result JSON:", resultRaw)
                            Vue.set(this.serie, 'setupStatus', 'failed')
                        }
                    }
                    } catch (pollErr) {
                        console.warn("Poll error (non-fatal, retrying):", pollErr.message)
                    }
                }, 2000)  // poll every 2s
            }
            
        },
         beforeDestroy() {
            clearInterval(this.pollInterval)
        }
    }
</script>

<style lang="scss" scoped>
</style>