<template>
    
    <v-card :disabled="readonly" >
        <!-- <v-overlay v-model="overlay">
            <v-row align="center" justify="center"><label >Importing, Please wait..</label> </v-row>
            <v-row align="center" justify="center">
                <v-progress-circular
                color="primary"
                indeterminate
                size="55"
                ></v-progress-circular> 
                
            </v-row> 
        </v-overlay> -->
        <file-browser-dialog ref="filedialog" />
       <!--  <v-card-title class="subtitle-1 font-weight-bold">
      Import form
    </v-card-title> -->

        <v-row align="center" justify="center" dense> 

            <v-col cols="8" sm="4" md="5">
                <v-text-field dense outlined 
                    label="Image name regex" 
                    v-model="serie.import_regex"
                    
                    >
                </v-text-field>
            </v-col>
            <v-col cols="4" sm="2" md="3">
                <v-select dense
                    :items="plugin"
                    v-model="serie.import_io"
                    label="I/O plugin"
                    outlined
                    
                    >
                </v-select>
            </v-col>
            <v-col cols="4" sm="2" md="2">
                 <v-checkbox
                    v-model="serie.import_scanAll"
                    label="(Re-)scan all files"
                    ></v-checkbox>

            </v-col>
             <v-col cols="4" sm="2" md="2">
                 <v-checkbox
                    v-model="serie.import_sparseData"
                    label="Sparse data"
                    
                    ></v-checkbox>

            </v-col>
        </v-row>
        <v-row dense v-if="serie.volumePath != null" >
            <v-col cols="4" sm="2" md="3" >
                <v-select dense
                    :items="firstaxis"
                    v-model="serie.import_firstaxis"
                    label="First axis"
                    outlined
                    return-object
                    >
                </v-select>
            </v-col>
            <v-col cols="4" sm="2" md="3" >
                <v-select dense
                    :items="secondaxis"
                    v-model="serie.import_secondaxis"
                    label="Second axis"
                    outlined
                    return-object
                                            >
                </v-select>
            </v-col>
            <v-col cols="4" sm="2" md="3" >
                <v-select dense
                    :items="thirdaxis"
                    v-model="serie.import_thirdaxis"
                    label="Third axis"
                    outlined
                    return-object
                                            >
                </v-select>
            </v-col>
            <v-col cols="4" sm="2" md="3" >
                <v-select dense
                    :items="volumeFormat"
                    v-model="serie.import_volFormat"
                    label="Volume format"
                    outlined
                    return-object
                >
                </v-select>
            </v-col>
           
            
        </v-row>
        <v-row dense>
             
            <v-col cols="5" sm="2" md="3" v-if="serie.volumePath != null">
                 
                <v-text-field 
                    dense 
                    outlined
                    type=number
                    label="voxel(microm):1,00" 
                    step="0.1"
                    min="0.1"
                    v-model="serie.import_voxel1"
                >
                </v-text-field>
               
            </v-col>
            <v-col cols="5" sm="2" md="3" v-if="serie.volumePath != null">
                <v-text-field 
                    dense 
                    outlined
                    type=number
                    label="voxel(microm):1,00" 
                    step="0.1"
                    min="0.1"
                    v-model="serie.import_voxel2"
                >
                </v-text-field>
            </v-col>
            <v-col cols="5" sm="2" md="3" v-if="serie.volumePath != null">
                <v-text-field 
                    dense 
                    outlined
                    type=number
                    label="voxel(microm):1,00" 
                    step="0.1"
                    min="0.1"
                    v-model="serie.import_voxel3"
                >
                </v-text-field>
            </v-col>
           
            
        </v-row>
        <v-row dense>
            <v-col cols="4" sm="2" md="2">
                <v-tooltip top>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn 
                                    color="primary" rounded dark default 
                                    v-bind="attrs" v-on="on" @click.stop="importFiles">
                                        Import
                                </v-btn>
                            </template>
                            <span>Import from directory</span>
                        </v-tooltip>
               
            </v-col>

            <v-col cols="8" sm="10" md="8">
                    <v-alert 
                        v-if="serie.importStatus === 'pending'" 
                        type="info"
                        text
                    >
                        Importing file... checking every 2s
                    </v-alert>
                    <v-alert 
                        v-if="serie.importStatus === 'completed'" 
                        type="success"
                        text
                    >
                         Import complete
                    </v-alert>
                    <v-alert 
                        v-if="serie.importStatus === 'failed'" 
                        type="error"
                        text
                    >
                         Import failed : {{ errorMessage  }}
                    </v-alert>
            </v-col>
        </v-row>
            
           
       

        <v-divider class="my-4" />

        <v-card-title class="subtitle-1 font-weight-bold">
            Volume information
        </v-card-title>

         <v-row dense>
      <v-col cols="12" sm="8" md="12">
        <v-text-field dense outlined label="Absolute path" v-model="serie.import_abspath" :readonly="true" />
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="6" sm="4" md="6">
        <v-text-field dense outlined label="Number of tiles (rows)" v-model="serie.import_tilesRows" :readonly="true"  />
      </v-col>
      <v-col cols="6" sm="4" md="6">
        <v-text-field dense outlined label="Number of tiles (columns)" v-model="serie.import_tilesCols" :readonly="true" />
      </v-col>
    </v-row>
    <v-row dense>
        <v-col cols="4" sm="2" md="4">
          <v-text-field dense outlined label="Tile dimensions X (voxels)" v-model="serie.import_tiledimX" :readonly="true" />
        </v-col>
        <v-col cols="4" sm="2" md="4">
          <v-text-field dense outlined label="Tile dimensions Y (voxels)" v-model="serie.import_tiledimY" :readonly="true" />
        </v-col>
        <v-col cols="4" sm="2" md="4">
          <v-text-field dense outlined label="Tile dimensions Z (voxels)" v-model="serie.import_tiledimZ" :readonly="true" />
        </v-col>

    </v-row>
    <v-row dense>
        <v-col cols="4" sm="2" md="4">
          <v-text-field dense outlined label="Voxel dims X (µm)" v-model="serie.import_voxeldimX" :readonly="true" />
        </v-col>
        <v-col cols="4" sm="2" md="4">
          <v-text-field dense outlined label="Voxel dims Y (µm)" v-model="serie.import_voxeldimY" :readonly="true" />
        </v-col>
        <v-col cols="4" sm="2" md="4">
          <v-text-field dense outlined label="Voxel dims Z (µm)" v-model="serie.import_voxeldimZ" :readonly="true" />
        </v-col>

    </v-row>

    <v-row dense>
      <v-col cols="4" sm="2" md="4">
        <v-text-field dense outlined label="Origin X (mm)" v-model="serie.import_originX" :readonly="true" />
      </v-col>
      <v-col cols="4" sm="2" md="4">
        <v-text-field dense outlined label="Origin Y (mm)" v-model="serie.import_originY" :readonly="true" />
      </v-col>
      <v-col cols="4" sm="2" md="4">
        <v-text-field dense outlined label="Origin Z (mm)" v-model="serie.import_originZ" :readonly="true" />
      </v-col>
    </v-row>
    <v-row dense>
        <v-col cols="6" sm="4" md="6">
            <v-text-field dense outlined label="Tile overlap X (voxels)" v-model="serie.import_tileoverlapX" :readonly="true" />
        </v-col>
        <v-col cols="6" sm="4" md="6">
            <v-text-field dense outlined label="Tile overlap Y (voxels)" v-model="serie.import_tileoverlapY" :readonly="true" />
        </v-col>

    </v-row>

    <v-row dense>
      <v-col cols="4" sm="2" md="4">
        <!-- <v-text-field  dense outlined label="Stitch test" v-model="serie.import_stitchTest" type="number" min="1" max="serie.import_tiledimZ" /> -->
        <v-text-field dense outlined label="Stitch test" :value="stitchTest" readonly ><template v-slot:append>
                <v-btn icon small @click="decrementStitch">
                -
                </v-btn>
                <v-btn icon small @click="incrementStitch">
                +
                </v-btn>
            </template>
        </v-text-field>
      </v-col>
      <v-col cols="4" sm="2" md="4">
        <v-select dense outlined label="Channels" :items="channel" item-text="label"
                        item-value="value" v-model="serie.import_channel"  />
      </v-col>
     <!--  <v-col cols="4" sm="2" md="4">
        <v-tooltip top>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn 
                                    color="primary" rounded dark default 
                                    v-bind="attrs" v-on="on">
                                        Preview
                                </v-btn>
                            </template>
                            <span>Preview</span>
                        </v-tooltip>
        
      </v-col> -->
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
        name: 'TerastitcherImport',
        props: {
            readonly: { type: Boolean, default: false }, 
        },
        components: {
            FileBrowserDialog,
        },
        data() {
            return {
                serie: {importStatus: null},
                outputBasePath: '',
                outputFolderName: '',
                origionalSerie: {}, 
                metadataValuesRules: [
                    value => value && value > 0 || 'Must be a positive number'
                ], 
                plugin: ['tiff2D', 'IMS_HDF5','dcimg', 'tiff3D', 'MultiVolume'],
                firstaxis:['Y', '-Y', 'X', '-X' ],
                secondaxis:['X','-X','Y','-Y'],
                thirdaxis:['X','-X','Y','-Y','Z'],
                volumeFormat:['TiledXY|2Dseries', 'TiledXY|3Dseries'],
                channel:[
                    {label:'unselected', value:1},
                    {label:'all channels', value:2}
                ],
                volumeData:{},
                stitchX:0,
                overlay :false,
                loading:false,
                pollInterval: null,
                pollingActive: false,
                errorMessage: null,

              

            }
        },
        watch: {
            stitchTest(newVal) {
                this.serie.import_stitchTest = newVal
            }
            },
        computed: {
            stitchTest: {
                get() {
                    if(this.serie.import_tiledimZ) {

                        return `${this.stitchX}/${this.serie.import_tiledimZ}`
                    }
                    else return null

                },
                set(val) {
                    const parts = val.split("/")
                    if (parts.length === 2) {
                        const x = parseInt(parts[0])
                        if (!isNaN(x)) {
                            this.stitchX = x
                        }
                    }
                }
            }

        },

        methods: {
            // return the data
            get_serie(){
                return this.serie
            },
            async load_serie(serie,isfolder){
                console.log("at load serie import")
                //this.serie = serie
                const source = serie?.setting != null ? serie.setting : serie
                //const source = serie
                this.serie = Object.assign({}, source)
                //this.serie = Object.assign({}, serie.setting)
                //Vue.set(this.serie, 'importStatus', null)
                Vue.set(this.serie, 'isfolder', isfolder)
                Vue.set(this.serie, 'import_tiledimZ', 0)
                Vue.set(this.serie, 'import_channel', 1)
                //this.serie.importStatus = null
                console.log("this.serie after load")
                console.log(this.serie)
                // update outputpath
                if(serie.outputPath) {
                    this.serie.outputPath = serie.outputPath
                    var _pathParts = serie.outputPath.split("/")
                    this.outputBasePath = _pathParts.slice(0,-1).join("/")
                    this.outputFolderName = _pathParts.slice(-1)[0]
                    console.log("this.outputBasePath")
                    console.log(this.outputBasePath)
                    console.log("this.outputFolderName")
                    console.log(this.outputFolderName)
                } else {
                    this.outputBasePath = ""
                    this.outputFolderName = ""
                }
            },

            //import files here
            async importFiles(){
                
                let importData = {}
                importData = this.serie
                Vue.set(this.serie, 'importStatus', 'pending')
                //this.serie.importStatus = 'pending'
                console.log("Importing with data:", this.serie)
                console.log("Importing with data status:", this.serie.importStatus)

                  Vue.notify({
                    group: 'datanotif',
                    type: 'info',
                    title: 'Importing',
                    text: 'Submitted for Data Import',
                    closeOnClick: true,
                    duration: 3000,
                })
               

                try{
                    console.log("import data")
                    console.log(importData)
                    importData.teraStep = "import"
                    /* this.overlay =true
                    this.loading=true */
                    let response = await TerastitcherAPI.submit_step(importData,importData.outputPath)
                    const output = response.commandResult[0].output
                    //console.log("Job submitted, HPC job ID:", jobId)
                    console.log("Import job response:", response.commandResult[0].output)

                    const match = output.match(/Submitted batch job (\d+)/)
                    if (!match) throw new Error("Could not parse job ID from: " + output)
                    const jobId = match[1]
                    console.log("SLURM job ID:", jobId)
                    this.serie.importJobId = jobId
                    Vue.set(this.serie, 'importStatus', 'pending')
                    this.startPolling(jobId, importData.outputPath, 'import')


                }catch(err){
                    Vue.$log.error("-----error submittin-----------")
                    Vue.$log.error(err)
                    
                    Vue.notify({
                        group: 'datanotif',
                        type: 'error',
                        title: 'Submission',
                        text: 'Error importing data',
                        closeOnClick: true,
                        duration: 10000,
                    })
                }
                

            },
            startPolling(jobId, outputPath, step) {
                this.pollingActive = true 
                this.pollInterval = setInterval(async () => {
                    if (!this.pollingActive) return 
                    try {
                    const response = await TerastitcherAPI.poll_step_status(jobId, outputPath)
                    const status = response.commandResult[0].output || ""
                    console.log("Status response:", response)
                    console.log("Status string:", status)

                    const slurmState = status.split('\n')[0].trim()
                    console.log("SLURM state:", slurmState)
                    

                    const isDone =  slurmState.startsWith("<FILENAME>") || ["COMPLETED", "FAILED", "NOTFOUND","SUSPENDED"].includes(slurmState) || !['RUNNING', 'PENDING'].includes(slurmState)
                    //const isDone = slurmState.startsWith("PROGRESS:") || ["COMPLETED", "FAILED", "NOTFOUND"].includes(slurmState)
                    console.log("isDone check:", isDone)
                    if (isDone) {
                        this.pollingActive = false
                        clearInterval(this.pollInterval)

                        try {
                            // Fetch result JSON written by python
                            const resultResp = await TerastitcherAPI.get_step_result(outputPath, step)
                            console.log("import result response:", resultResp)

                           /*  if (!resultResp.commandResult || resultResp.commandResult.length === 0) {
                                console.warn("Empty response received (304 Not Modified)")
                                return
                            } */
                            const resultRaw = resultResp.commandResult.map(item => item.output).join('')
                            console.log("import result resultRaw:", resultRaw)

                        
                            const result = JSON.parse(resultRaw)
                            console.log("Parsed import result:", result)
                            if (result) {
                               // this.serie.importStatus = 'completed'
                                Vue.set(this.serie, 'importStatus', 'completed')
                                await this.updateinfo(result)
                                
                                /* let mdata_output = response.commandResult

                                if(mdata_output){
                                    const jsonString = mdata_output
                                    .map(x => x.out)
                                    .join("\n")
                                    .match(/\{[\s\S]*?\}/)[0];

                                    const metadata = JSON.parse(jsonString);
                                    this.volumeData = metadata
                                    await this.updateinfo(this.volumeData)
                                    console.log(metadata)
                                    

                                }

                                this.overlay =false
                                this.loading=false */
                                /* this.$set(this.serie, 'project_displacements', result.displacement_total)
                                this.$set(this.serie, 'project_ppdisplacements', result.displacement_per_stack_pair) */
                                Vue.notify({
                                group: 'datanotif', type: 'success',
                                title: 'Import Complete',
                                text: `Import completed successfully.`,
                                closeOnClick: true, duration: 5000,
                                })
                            } else {
                                // this.serie.importStatus = 'failed'
                                Vue.set(this.serie, 'importStatus', 'failed')
                                this.errorMessage = result.error || 'Unknown error'
                                Vue.notify({
                                group: 'datanotif', type: 'error',
                                title: 'Import Failed',
                                text: this.errorMessage,
                                closeOnClick: true, duration: 8000,
                                })
                            }
                        } catch (resultErr) {
                            if (resultErr.response?.status === 304) {
                                console.warn("Result endpoint returned 304 - job already processed")
                                return
                            }
                            console.error("Error fetching result:", resultErr)
                           // this.serie.importStatus = 'failed'
                            Vue.set(this.serie, 'importStatus', 'failed')
                        }
                    }
                    } catch (pollErr) {
                        console.warn("Poll error (non-fatal, retrying):", pollErr.message)
                    }
                }, 2000)  // poll every 2s
            },
    
        
            beforeDestroy() {
                clearInterval(this.pollInterval)
            },
            

            async updateinfo(metadata) {
                this.serie = {
                    ...this.serie,
                    import_abspath: metadata.stacks_dir,
                    import_tilesRows: metadata.N_ROWS,
                    import_tilesCols: metadata.N_COLS,
                    import_tiledimX: metadata.WIDTH,
                    import_tiledimY: metadata.HEIGHT ,
                    import_tiledimZ: metadata.DEPTH,
                    import_voxeldimY: metadata.VXL_V,
                    import_voxeldimX: metadata.VXL_H,
                    import_voxeldimZ: metadata.VXL_D,
                    import_originY: metadata.ORG_V,
                    import_originX: metadata.ORG_H,
                    import_originZ: metadata.ORG_D,
                    import_mecV: metadata.MEC_V,
                    import_mecH: metadata.MEC_H,
                    import_n_slices: metadata.N_SLICES
                   /*  import_dimD: metadata.DIM_D,
                    import_dimH: metadata.DIM_H,
                    import_dimV: metadata.DIM_V */
                }
                let tileOverlapX = this.serie.import_tiledimX - (this.serie.import_mecH/this.serie.import_voxeldimX)
                this.serie.import_tileoverlapX = Math.floor(tileOverlapX)
                let tileOverlapY = this.serie.import_tiledimY - (this.serie.import_mecV/this.serie.import_voxeldimY)
                this.serie.import_tileoverlapY = Math.floor(tileOverlapY)
                this.stitchX = (this.serie.import_tiledimZ) / 2 
                console.log("serie data after update")
                console.log(this.serie)
            },

            incrementStitch(){
                if (this.stitchX < this.serie.import_tiledimZ) {
                        this.stitchX++
                    }

            },
            decrementStitch(){
                if (this.stitchX >1) {
                        this.stitchX--
                    }

            },


        },
    }
</script>

