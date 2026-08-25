<template>
    <v-card :disabled="readonly" >
        <file-browser-dialog ref="filedialog" />
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
       
        <!-- <v-row class="mb-2" style="margin-top: 5px;">
            <v-col cols="12" class="d-flex align-center justify-center py-4">
                <strong class="text-h6">Outputs</strong>
            </v-col>
            <v-col>

                <v-table>
                    <thead>
                        <tr >
                            <th></th>
                            <th   style="padding-left: 20px;">Resolution (X × Y × Z)</th>
                            <th  style="padding-left: 20px;">Size (GVoxels)</th>
                            <th style="padding-left: 20px;" class="text-center">Save to disk</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(o, i) in outputs" :key="i">
                            <td></td>
                            <td  style="padding-left: 20px;">{{ o.resolution }}</td>
                            <td  style="padding-left: 20px;">{{ o.size.toFixed(3) }}</td>
                            <td class="text-center">
                                

                                    <v-checkbox
                                        v-model="o.save"
                                        density="compact"
                                        hide-details
                                        @change="updateMemUsage()"
                                    />
                                
                            </td>
                        </tr>
    
                    </tbody>
                </v-table>
            </v-col>

        </v-row> -->
       
<v-row class="mb-2" style="margin-top: 5px;" align="center">
    <v-col cols="2" class="d-flex align-center justify-center">
        <strong class="text-h6">Outputs</strong>
    </v-col>
    <v-col cols="10">
        <v-table>
            <thead>
                <tr>
                    <th style="padding-left: 20px;">Resolution (X × Y × Z)</th>
                    <th style="padding-left: 20px;">Size (GVoxels)</th>
                    <th style="padding-left: 20px;" class="text-center">Save to disk</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(o, i) in outputs" :key="i" style="vertical-align: middle;">
                    <td style="padding-left: 20px; vertical-align: middle;">{{ o.resolution }}</td>
                    <td style="padding-left: 20px; vertical-align: middle;">{{ o.size.toFixed(3) }}</td>
                    <td class="text-center" style="vertical-align: middle;">
                        <div class="d-flex justify-center align-center">
                            <v-checkbox
                                v-model="o.save"
                                density="compact"
                                hide-details
                                style="margin: 0; padding: 0; flex: none;"
                                @change="updateMemUsage()"
                            />
                        </div>
                    </td>
                </tr>
            </tbody>
        </v-table>
    </v-col>
</v-row>

        <v-row>
            <v-col cols="5" sm="2" md="3">
                <v-select dense
                    :items="formats"
                    v-model.number="serie.merge_formats"
                    item-text="label"
                    item-value="value"
                    label="Format"
                    outlined
                    @change="showprops"
                    >
                </v-select>
            </v-col>
       
                

                <v-col cols="5" sm="3" md="4" v-if="isims">
                    <v-text-field dense outlined 
                        label="Image metadata .ims file" 
                        v-model="imsfilepath"
                        
                        >
                    </v-text-field>
                </v-col>
                <v-col cols="5" sm="2" md="2" v-if="isims">
                    <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn 
                                class="mx-1" 
                                color="primary" 
                                @click.stop="chooseMetadataFile"
                                rounded dark default 
                                v-bind="attrs" v-on="on">
                               metadata file
                            </v-btn>
        
                        </template>
                        <span>Enter or select image metadata .ims file (optional)</span>
                    </v-tooltip>
               
                </v-col>
                <v-col cols="5" sm="2" md="3" v-if="isims">
                    <v-text-field dense outlined 
                        label="Compressor options (optional,format: ID[:opt1:opt2:...])" 
                        v-model="serie.merge_compressor"
                        
                        >
                    </v-text-field>
                </v-col>
             
            
       

           
            <v-col cols="4" sm="2" md="3" v-if="isheight">
                <v-text-field 
                    dense 
                    outlined
                    type=number
                    label="Height" 
                    v-model="serie.merge_fmt_h"
                >
                </v-text-field>
            </v-col>
            <v-col cols="4" sm="2" md="3" v-if="iswidth">
                <v-text-field 
                    dense 
                    outlined
                    type=number
                    label="Width" 
                    v-model="serie.merge_fmt_w"
                >
                </v-text-field>
            </v-col>
            <v-col cols="4" sm="2" md="3" v-if="isdepth">
                <v-text-field 
                    dense 
                    outlined
                    type=number
                    label="Depth" 
                    v-model="serie.merge_fmt_d"
                >
                </v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" sm="2" md="3">
                <v-text-field 
                    dense 
                    outlined
                    label="Memory usage :" 
                    v-model="serie.merge_memusage"
                    @input="computeOutputs()"
                    readonly
                >
                </v-text-field>
            </v-col>
        </v-row>

        
        <v-row>
            <v-expansion-panels v-model="merge_advanced" accordion>
                <v-expansion-panel>
                    <v-expansion-panel-header>
                        <b>Advanced Options</b>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content >
                        <v-row>
                            <v-col cols="3" sm="1" md="1" class="d-flex align-center">
                                <strong>XYZC selection</strong>
                            </v-col>

                            <v-col cols="3" sm="1" md="1">
                                <v-text-field 
                                    dense 
                                    outlined
                                    type=number
                                    label="X" 
                                    v-model="serie.merge_x1"
                                >
                                </v-text-field>
                            </v-col>
                            <v-col cols="3" sm="1" md="2">
                                <v-text-field 
                                    dense 
                                    outlined
                                    type=number
                                    label="X" 
                                    v-model="serie.merge_x2"
                                >
                                </v-text-field>
                            </v-col>
                            <v-col cols="3" sm="1" md="1">
                                <v-text-field 
                                    dense 
                                    outlined
                                    type=number
                                    label="Y" 
                                    v-model="serie.merge_y1"
                                >
                                </v-text-field>
                            </v-col>
                            <v-col cols="3" sm="1" md="2">
                                <v-text-field 
                                    dense 
                                    outlined
                                    type=number
                                    label="Y" 
                                    v-model="serie.merge_y2"
                                >
                                </v-text-field>
                            </v-col>
                            <v-col cols="3" sm="1" md="1">
                                <v-text-field 
                                    dense 
                                    outlined
                                    type=number
                                    label="Z" 
                                    v-model="serie.merge_z1"
                                >
                                </v-text-field>
                            </v-col>
                            <v-col cols="3" sm="1" md="1">
                                <v-text-field 
                                    dense 
                                    outlined
                                    type=number
                                    label="Z" 
                                    v-model="serie.merge_z2"
                                >
                                </v-text-field>
                            </v-col>
                            <v-col cols="4" sm="2" md="3">
                                <v-select dense
                                        :items="channel"
                                        item-text="label"
                                        item-value="value"
                                        v-model="serie.merge_channel"
                                        label="Channel selection"
                                        outlined
                                        
                                    >
                                </v-select>
                            </v-col>
                        </v-row>
                        <v-row>

                            <v-col cols="8" sm="4" md="6">
                               <v-select dense
                                        :items="blend"
                                        v-model="serie.merge_blend"
                                        label="Blending"
                                        item-text="label"
                                        item-value="value"
                                        outlined
                                        
                                        
                                    >
                                </v-select>


                            </v-col>
                            <v-col cols="8" sm="4" md="6">
                                 <v-select dense
                                        :items="artifacts"
                                        v-model="serie.merge_artifactrmv"
                                        label="Artifacts removal"
                                        outlined
                                        item-text="label"
                                        item-value="value"
                                    >
                                </v-select>
                            </v-col>
                            <v-col cols="4" sm="2" md="3">
                                <v-checkbox
                                    v-model="serie.merge_uncompressed"
                                    label="uncompressed"
                                    ></v-checkbox>

                            </v-col>
                            <v-col cols="4" sm="2" md="3">
                                <v-checkbox
                                    v-model="serie.merge_bigtiff"
                                    label="bigtiff"
                                    ></v-checkbox>

                            </v-col>
                            <v-col cols="4" sm="2" md="3">
                                <v-checkbox
                                    v-model="serie.merge_isotropic"
                                    label="isotropic"
                                    ></v-checkbox>

                            </v-col>
                        </v-row>
                     
                    </v-expansion-panel-content>
                </v-expansion-panel>
                
            </v-expansion-panels>
        </v-row>
        <v-row>
            <v-expansion-panels v-model="merge_device" accordion>
                <v-expansion-panel >
                <v-expansion-panel-header><b>Devices</b></v-expansion-panel-header>
                <v-expansion-panel-content eager>
                    <!-- <deconvolution-devices ref="revdecondevices" :readonly="true"/> -->
                    <TerastitcherDevices  ref="teradevices" />
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
                            v-bind="attrs" v-on="on" @click.stop="merge_compute">
                                Merge
                        </v-btn>
                    </template>
                    <span>Merging</span>
                </v-tooltip>
               
            </v-col>
        </v-row>


    </v-card>

</template>
<script>
    import Vue from 'vue';
    //import series from "@/utils/series.js"
    import PreferenceAPI from "@/api/PreferenceAPI"
    import FileBrowserDialog from '@/components/FileBrowserDialog.vue'
    import miscs from '@/utils/miscs.js'
    import DeconvolutionAPI from "@/api/DeconvolutionAPI.js"
    import TerastitcherAPI from '../../api/TerastitcherAPI';
    import TerastitcherDevices from '@/components/terastitcher/Devices.vue'

    const HDF5_FORMATS = [6, 7]
    const MAX_RESOLUTIONS = 6
    
    export default {
        name: 'TerastitcherMerge',
        props: {
            readonly: { type: Boolean, default: false }, 
        },
        components: {
            FileBrowserDialog,
            TerastitcherDevices
        },
        data() {
            return {
                serie: {},
                
                
                channel:[{label:'All Channels', value:'all'}, {label:'R', value:'R'}, {label:'G', value:'G'}, {label:'B', value:'B'}],
                formats:[
                    {label:'TIFF (series, 2D)', value:1},
                    {label:'TIFF (tiled, 2D)', value:2},
                    {label:'TIFF (tiled, 3D)', value:3},
                   /*  {label:'TIFF (tiled, 4D)', value:4}, */
                    {label:'TIFF (3D)', value:5},
                    {label:'HDF5 (BigDataViewer)', value:6},
                    {label:'HDF5 (Imaris IMS)', value:7}
                    /* {label:'Vaa3D raw (series, 2D)', value:8},
                    {label:'Vaa3D raw (tiled, 2D)', value:9},
                    {label:'Vaa3D raw (tiled, 3D)', value:10},
                    {label:'Vaa3D raw (tiled, 4D)', value:11} */

                ],
                blend:[{label:'No Blending', value:'NOBLEND'}, {label:'Sinusoidal Blending', value:"SINBLEND"}, {label:'No Blending with emphasized stacks borders', value:"STACKMARGIN"}],
                artifacts:[{label:'None', value:0}, {label:'Zebrated pattern (Y)', value:1}, {label:'Zebrated pattern (X)', value:2}, {label:'Zebrated pattern (Z)', value:3}],
                estmemory:65.6523,
                outputs:[],
                dimV:0, 
                dimH:0,
                dimD:0,
                vxlV:0,
                vxlH:0, 
                vxlD:0,
                isheight:false,
                iswidth:false,
                isdepth:false,
                isims:false,
                imsfilepath:null,
                merge_advanced: null,
                userLimits:[],
                nodeLimits:[],
            }
        },

          watch: {
            // recompute whenever the subvolume selection or isotropic flag changes
            'serie.merge_x1': 'computeOutputs',
            'serie.merge_x2': 'computeOutputs',
            'serie.merge_y1': 'computeOutputs',
            'serie.merge_y2': 'computeOutputs',
            'serie.merge_z1': 'computeOutputs',
            'serie.merge_z2': 'computeOutputs',
            'serie.merge_isotropic': 'computeOutputs',
            'serie.merge_formats': 'computeOutputs',
        },
        
        methods: {
            // return the data
            get_serie(){
                this.serie.merge_outputs = this.outputs.filter(o => o.save)
                if (this.$refs.teradevices) {
                    Object.assign(this.serie, this.$refs.teradevices.get_serie())
                }
                return this.serie
            },
            async load_serie(serie){
                this.serie = Object.assign({}, serie)
                Vue.set(this.serie, 'merge_formats', 1)
                console.log("this.serie.merge", this.serie)
                console.log("raw placedims:", this.serie.placedim_v, this.serie.placedim_h, this.serie.placedim_d)
                this.dimV = Number(this.serie.placedim_v || 0)
                this.dimH = Number(this.serie.placedim_h || 0)
                this.dimD = Number(this.serie.placedim_d || 0)
                this.vxlV = Number(this.serie.import_voxeldimY || 0)
                this.vxlH = Number(this.serie.import_voxeldimX || 0)
                this.vxlD = Number(this.serie.import_voxeldimZ || 0)

                console.log("placedims:", this.dimV, this.dimH, this.dimD)
                console.log("voxel dims:", this.vxlV, this.vxlH, this.vxlD)

                Vue.set(this.serie, 'merge_x1', this.serie.merge_x1 ?? 0)
                Vue.set(this.serie, 'merge_x2', this.serie.merge_x2 ?? this.dimH - 1)
                Vue.set(this.serie, 'merge_y1', this.serie.merge_y1 ?? 0)
                Vue.set(this.serie, 'merge_y2', this.serie.merge_y2 ?? this.dimV - 1)
                Vue.set(this.serie, 'merge_z1', this.serie.merge_z1 ?? 0)
                Vue.set(this.serie, 'merge_z2', this.serie.merge_z2 ?? this.dimD - 1)
                if (this.serie.merge_outputs) {
                    this.outputs = this.serie.merge_outputs
                } 

                
                this.computeOutputs()
                this.getUserLimits()
                this.$nextTick(() => {
                    if (this.$refs.teradevices) {
                        this.$refs.teradevices.load_serie(this.serie)
                    }
                })

               
            },

            async getUserLimits(){
                let userLimitResponse =  await DeconvolutionAPI.user_limits()
                let output = userLimitResponse.commandResult
                const userlimits =  output.find(entry => entry.out.startsWith('{"user_limits"'))
                let json_output =  JSON.parse(userlimits.out)
                this.userLimits = json_output.user_limits
                this.nodeLimits = json_output.node_limits
                console.log("userLimits", this.userLimits)
                console.log("nodeLimits", this.nodeLimits)
                
            },

            computeOutputs(){

                console.log("computeOutputs called")
                if (!this.dimV || !this.dimH || !this.dimD) {
                    console.log("dims not set")
                    this.outputs = []
                    this.serie.merge_memusage = '0 MB'
                    return
                }

                const x0 = Number(this.serie.merge_x1 ?? 0)
                const x1 = Number(this.serie.merge_x2 ?? this.dimH - 1)
                const y0 = Number(this.serie.merge_y1 ?? 0)
                const y1 = Number(this.serie.merge_y2 ?? this.dimV - 1)
                const z0 = Number(this.serie.merge_z1 ?? 0)
                const z1 = Number(this.serie.merge_z2 ?? this.dimD - 1)

                const isotropic = this.serie.merge_isotropic === true
                const skipIsotropicRule = HDF5_FORMATS.includes(this.serie.merge_formats)

                const halvePow2 = new Array(MAX_RESOLUTIONS).fill(0)
                console.log("computeOutputs called with x0,x1,y0,y1,z0,z1:", x0, x1, y0, y1, z0, z1, isotropic, skipIsotropicRule, halvePow2)
                if (isotropic && !skipIsotropicRule) {
                    let vxlVx2 = 2 * Math.abs(this.vxlV)
                    let vxlHx2 = 2 * Math.abs(this.vxlH)
                    let vxlD = this.vxlD
                    halvePow2[0] = 0
                    for (let i = 1; i < MAX_RESOLUTIONS; i++) {
                        halvePow2[i] = halvePow2[i - 1]
                        if (vxlD < Math.max(vxlVx2, vxlHx2)) {
                            halvePow2[i]++
                            vxlD *= 2
                        }
                        vxlVx2 *= 2
                        vxlHx2 *= 2
                    }
                } else {
                    for (let i = 0; i < MAX_RESOLUTIONS; i++) halvePow2[i] = i
                }

                const outputs = []
                const preSave = this.outputs.map(o => o.save) // remember which resolutions were previously selected
                //let maxRes = 0

                for (let i = 0; i < MAX_RESOLUTIONS; i++) {
                    const height = Math.floor((y1 - y0 + 1) / Math.pow(2, i))
                    const width = Math.floor((x1 - x0 + 1) / Math.pow(2, i))
                    const depth = Math.floor((z1 - z0 + 1) / Math.pow(2, halvePow2[i]))

                    if (!height || !width || !depth) break 

                    const size = (height / 1024) * (width / 1024) * (depth / 1024)
                    outputs.push({
                        resolution: `${width} × ${height} × ${depth}`,
                        size,
                        save: preSave.length ? !!preSave[i] : (i === 0)  // default: only full-res checked, 
                    })
                    //maxRes = i
                }

                this.outputs = outputs
               
                //this.serie.merge_outputs = this.outputs
                console.log("this.outputs", x0, x1, y0, y1)
                console.log(this.outputs.map(o => ({res: o.resolution, save: o.save})))
                this.updateMemUsage(x0, x1, y0, y1)
                

            },

            updateMemUsage(x0, x1, y0, y1) {
                let maxRes = 0
                this.outputs.forEach((o, i) => {
                    if (o.save) maxRes = Math.max(maxRes, i)
                })
                if (x0 === undefined || x1 === undefined || y0 === undefined || y1 === undefined) {
                    x0 = Number(this.serie.merge_x1 ?? 0)
                    x1 = Number(this.serie.merge_x2 ?? this.dimH - 1)
                    y0 = Number(this.serie.merge_y1 ?? 0)
                    y1 = Number(this.serie.merge_y2 ?? this.dimV - 1)
                }
                const layerHeight = y1 - y0 + 1
                const layerWidth = x1 - x0 + 1
                const layerDepth = Math.pow(2, maxRes)
                const mbytes = (layerHeight / 1024) * (layerWidth / 1024) * layerDepth * 4
                console.log("updateMemUsage", layerHeight, layerWidth, layerDepth, mbytes,maxRes)
                this.serie.merge_memusage = `${mbytes.toFixed(0)} MB`
                let merge_resolution = this.outputs.map((o, i) => (o.save ? i : null)).filter(i => i !== null).join('')
                Vue.set(this.serie, 'merge_resolution', merge_resolution)

            },
           
            showprops() {
                if([2, 9].includes(this.serie.merge_formats)){
                    this.isheight = true
                    this.iswidth =  true
                    this.isdepth = false
                    this.isims =false
                }else if([3, 4, 10, 11].includes(this.serie.merge_formats)){
                    this.isheight = true
                    this.iswidth =  true
                    this.isdepth = true
                    this.isims =false

                }else if (this.serie.merge_formats == 7){
                    this.isims =true
                    this.isheight = false
                    this.iswidth =  false
                    this.isdepth = false

                }
                else {
                    this.isheight = false
                    this.iswidth =  false
                    this.isdepth = false
                    this.isims =false
                }


            },
            async chooseMetadataFile(){
                
                let options = await this.$refs.filedialog.open('selectfiles', 'Terastitcher', '/', false)
                if (!options.cancelled && options.path) {
                    let itemSize = miscs.convertFormattedStrToBytes(options.selectedItems[0].size)
                    if(itemSize * 2.2 > miscs.maxMemSize()){
                            Vue.notify({
                                group: 'sysnotif',
                                type: 'warning',
                                title: 'Unable to add file',
                                text: 'This file require too much memory to run! This file cannot be added'
                            })
                            return
                        }
                   
                    this.imsfilepath = options.selectedItems[0].path
                    Vue.set(this.serie, 'merge_imsfilepath', this.imsfilepath)
                   // this.serie.imsfilepath = this.imsfilepath 
                   
                }
            },
            openAdvanced () {
                this.$nextTick(() => {
                    this.merge_advanced = 0
                })
            },

            async merge_compute() {
                if (this.$refs.teradevices) {
                    Object.assign(this.serie, this.$refs.teradevices.get_serie())
                }
                let mergeData = {}
                mergeData = this.serie
                mergeData.outputPath = this.serie.outputPath
                mergeData.teraStep = "merge"
                console.log("Merging with data:", mergeData)
                if (mergeData.thrs_cal_data) {
                    delete mergeData.thrs_cal_data
                }
                if ([1,2].includes(mergeData.merge_formats)) {

                    mergeData.merge_volout_plugin = "TiledXY|2Dseries"
                    mergeData.merge_imout_plugin = "tiff2D"
                    mergeData.merge_imout_format = "tif"
                }else if ([3,5].includes(mergeData.merge_formats)) {
                    mergeData.merge_volout_plugin = "TiledXY|3Dseries"
                    mergeData.merge_imout_plugin = "tiff3D"
                    mergeData.merge_imout_format = "tif"
                } else if([6,7].includes(mergeData.merge_formats)) {
                    mergeData.merge_volout_plugin = "TiledXY|3Dseries"
                    mergeData.merge_imout_plugin = "IMS_HDF5"
                    mergeData.merge_imout_format = "ims"
                }
                let _job = await PreferenceAPI.create_tera_job(mergeData.id, true)
                console.log("Created job for merging:", _job)
                mergeData.job_id = _job.id
                console.log("Submitting merge step with data:", mergeData.job_id)
                console.log("Merging with data:", mergeData)
                Vue.notify({
                    group: 'datanotif',
                    type: 'info',
                    title: 'Merging',
                    text: 'Submitted for Merging. You will receive an email when the process is complete.',
                    closeOnClick: true,
                    duration: 5000,
                })
                try{
                    console.log("Submitting merge step with data:", mergeData)
                    const response =await TerastitcherAPI.submit_step(mergeData, mergeData.outputPath)
                    await PreferenceAPI.update_tera(mergeData.id, mergeData)
                    const output = response.commandResult[0].output
                    console.log("Merger job response:", response.commandResult[0].output)
                    const match = output.match(/Submitted batch job (\d+)/)
                    if (!match) throw new Error("Could not parse job ID from: " + output)
                    const jobId = match[1]
                    console.log("SLURM job ID:", jobId)
                    this.serie.mergeJobId = jobId
                    
                }catch (error) {
                    console.error("Error occurred while submitting merge step:", error)
                    Vue.notify({
                        group: 'datanotif',
                        type: 'error',
                        title: 'Merging',
                        text: 'Failed to submit for merging.',
                        closeOnClick: true,
                        duration: 3000,
                    })
                }

                location.reload();

            }

       

        },
    }
</script>

<style lang="scss" scoped>
</style>