<template>
    <v-card :disabled="readonly">
        
        
        <v-overlay v-model="overlay">
            <v-row align="center" justify="center"><label >Estimating memory, Please wait..</label> </v-row>
            <v-row align="center" justify="center"><v-progress-circular
                color="primary"
                indeterminate
                size="64"
            ></v-progress-circular></v-row>
            
        </v-overlay>
        <v-row align="center" justify="center">
            <v-switch
                v-model="estimateDevice"
                label="Estimate memory & number of GPUs for processing"
                >
            </v-switch> 
           
        </v-row>
        <v-row align="center" justify="center"><label class="messageText"> {{message}} </label></v-row>
        <v-col align="center" justify="center">
            
            <v-col cols="15" sm="3" md="4" style="padding-top:30px">
                <v-tooltip right>
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field 
                            dense 
                            outlined
                            v-bind="attrs"
                            v-on="on"
                            type=number
                            :rules="[rules.positiveInteger]"  
                            label="Number of instances [nodes]" 
                            v-model="serie.instances"
                        >
                        </v-text-field>
                    </template>
                    <span>The number of instances of Microvolution to be executed</span>
                </v-tooltip>
            </v-col>
            <v-col cols="15" sm="3" md="4">
                <v-tooltip right>
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field 
                            dense 
                            outlined
                            v-bind="attrs"
                            v-on="on"
                            type=number
                            :rules="[rules.positiveNumber]"  
                            label="Memory per instance[node]" 
                            v-model="serie.mem"
                            @change="is_cpu_valid()"
                        >
                        </v-text-field>
                    </template>
                    <span>The amount of memory (in Gbs) for each instance</span>
                </v-tooltip>
                <label class="errorText"> {{memError}} </label>
            </v-col>
            <v-col cols="15" sm="3" md="4">
                <v-tooltip right>
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field 
                            dense 
                            outlined
                            v-bind="attrs"
                            v-on="on"
                            type=number
                            :rules="[rules.positiveInteger]"  
                            label="Number of GPUs per instance[node]" 
                            v-model="serie.gpus"
                            @change="is_gpu_valid()"
                        >
                        </v-text-field>
                    </template>
                    <span>The number of GPUs to be used for each instance</span>
                </v-tooltip>
                <label class="errorText"> {{gpuError}} </label>
            </v-col>
        </v-col>
        
    </v-card>

</template>

<script>
    // import Vue from 'vue';
    import series from '@/utils/series.js'
    // api
    import DeconvolutionAPI from "@/api/DeconvolutionAPI.js"

    export default {
        name: 'DeconvolutionDevices',
        props: {
            readonly: { type: Boolean, default: false }, 
        },
        data() {
            return {
                serie: series.formatSeries(null),
                estimateDevice: false,
                overlay: false,
                loading: false,
                estimates: [],
                cpu: 0,
                gpu: 0,
                memError: null,
                gpuError: null,
                message: null,
                rules: {
                    positiveInteger: value => value && value > 0 && Number.isInteger(parseFloat(value)) || 'Must be a positive integer',
                    positiveNumber: value => value && value > 0 || 'Must be a positive number',
                }
                /* positiveInteger: [
                    value => value && value > 0 && Number.isInteger(parseFloat(value)) || 'Must be a positive integer'
                ], 
                positiveNumber: [
                    value => value && value > 0 || 'Must be a positive number'
                ],  */
            }
        },
        watch: {
            estimateDevice: function (val) {
                if (val) {
                    this.estimateMemory()
                }
             }
               
            
        },
        methods: {
            // return the data
            get_serie(){
                return this.serie
            },
            load_serie(serie_devices){
                console.log(serie_devices)
                this.serie = serie_devices
                
            },
            is_valid(){
                if(this.serie.instances && this.serie.instances >0
                    && this.serie.mem && this.serie.mem > 0 
                    && this.serie.gpus && this.serie.gpus > 0)
                    return true
                else
                    return false
            }, 
            is_cpu_valid(){
                if (this.cpu && this.serie.mem &&  this.cpu > 0 && this.serie.mem > 0 && this.cpu > Math.max(15,this.serie.mem)) {
                    this.memError = " Need "+ this.cpu + "GB memory: " + this.serie.mem + "GB is below estimate"
                } else {
                    this.memError = null 
                }

            },
            is_gpu_valid(){
                if (this.gpu && this.gpu > 0 && this.gpu > 16 && this.serie.gpus < Math.ceil(this.gpu/16)) {
                    this.gpuError =  'Need '+ Math.ceil(this.gpu/16)+ ' GPUs: add more GPUs or enable tiling'
                }else {
                    this.gpuError = null
                }
            },
            async estimateMemory() {
                let jobs = []
                console.log(this.serie)
                this.overlay =true
                this.loading=true
                let response = await DeconvolutionAPI.execute_microvolution(this.serie.outputPath, parseInt(this.serie.instances), 
                this.serie.mem, this.serie.gpus, this.serie, jobs, false, true)
                this.overlay =false
                this.loading=false
                this.message = 'Estimate complete'
                let output = response.commandResult
                console.log(output)
                if (output.length > 0) {
                    for (let i=0; i < output.length ; i++) {
                        if(output[i].out.startsWith("{\"estimates\":")){
                            let json_output =  JSON.parse(output[i].out)
                            this.estimates = json_output
                            console.log(this.estimates)
                            let cpuMem = this.estimates.estimates.cpuEstimate == 0 ? 1: this.estimates.estimates.cpuEstimate
                            let gpuMem = this.estimates.estimates.gpuEstimate == 0 ? 1 : this.estimates.estimates.gpuEstimate
                            this.cpu =  cpuMem + 5
                            this.gpu = gpuMem
                            console.log(cpuMem)
                            console.log(gpuMem)
                        }
                    }
                }
                this.is_cpu_valid()
                this.is_gpu_valid()
            },

        },
        
  }
</script>

<style lang="scss" scoped>
    .errorText {
        float:left;
        margin-top: -20px;
        margin-left: 20px;
        font-family: Roboto,sans-serif;
        text-align: left;
        font-size: 14px;
        color: orange;
    }
    .messageText {
        margin-top: -20px;
        font-size: 14px;
        color: green;
        font-family: Roboto,sans-serif;
    }
</style>