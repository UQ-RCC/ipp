<template>
    <v-card :disabled="readonly">
        
        
        <v-overlay v-model="overlay">
            <v-row align="center" justify="center"><label >Estimating memory, Please wait..</label> </v-row>
            <v-row align="center" justify="center">
                <v-progress-circular
                color="primary"
                indeterminate
                size="55"
                ></v-progress-circular> 
                
            </v-row>
            <v-row align="center" justify="center"><v-tooltip bottom >
                    <template v-slot:activator="{ on, attrs }" >
                        <v-btn 
                            rounded dark default  
                            color="primary" 
                            v-bind="attrs" 
                            v-on="on"
                            @click.stop="stopEstimate()">
                            Stop estimate
                        </v-btn>
                    </template>
                    <span>Click to stop the estimate job</span>
                </v-tooltip></v-row>
            
        </v-overlay>
        <v-row align="center" justify="center">
            <!-- <v-switch
                v-model="estimateDevice"
                label="Estimate memory & number of GPUs for processing"
                >
            </v-switch> --> 
            <!-- <v-col cols="15" sm="3" md="4">
                <h5>{{ queueTime }} </h5>
            </v-col> -->
            <v-col align="center" justify="center">

                <v-col v-if="api=='Microvolution'"   >
                    
    
                        <v-tooltip bottom >
                            <template v-slot:activator="{ on, attrs }" >
                                <v-btn 
                                    rounded dark default  
                                    color="primary" 
                                    v-bind="attrs" 
                                    v-on="on"
                                    @click.stop="estimateMemory()">
                                    Estimate 
                                </v-btn>
                                
                            </template>
                            <span>Estimate memory and number of GPUs for processing. {{ queueTime }} </span>
                        </v-tooltip>
                    
                    <label class="messageText"> {{message}} </label>
                   
                </v-col>
            </v-col>
            
        </v-row>

        <v-row align="center" justify="center">        
            <v-col align="center" justify="center">
                <v-col cols="8" sm="4" md="6" >
                    <h5>Resource allocation for the decon job</h5>
                    
                </v-col> 
                
                <v-col cols="8" sm="4" md="6" style="padding-top:30px">
                    <v-tooltip right>
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field 
                                dense 
                                outlined
                                v-bind="attrs"
                                v-on="on"
                                type=number
                                :rules="[rules.positiveInteger, rules.cpudefault]"  
                                label="Number of instances" 
                                v-model="serie.instances"
                               
                            >
                            </v-text-field>
                        </template>
                        <span v-if="nodeLimits.max_node_cpu_mem">Instance counts needing more than {{nodeLimits.max_node_cpu_mem}} GB or {{ nodeLimits.max_node_gpus }} GPUs will not run in parallel</span>
                    </v-tooltip>
                    <label class="errorText"> {{cpuError}} </label>
                </v-col>
                <v-col cols="8" sm="4" md="6">
                    <v-tooltip right>
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field 
                                dense 
                                outlined
                                v-bind="attrs"
                                v-on="on"
                                type=number
                                :rules="[rules.positiveInteger, rules.memdefault]"  
                                label="Memory per instance(in GB)" 
                                v-model="serie.mem"
                                @change="is_mem_valid()"
                            >
                            </v-text-field>
                        </template>
                        <span v-if="userLimits.max_user_mem">Your memory quota limit is {{ Math.min(nodeLimits.max_node_cpu_mem,userLimits.max_user_mem)}} GB</span>
                    </v-tooltip>
                    <label class="errorText"> {{memError}} </label>
                </v-col>
                <v-col cols="8" sm="4" md="6">
                    <v-tooltip right>
                        <template v-slot:activator="{ on, attrs }">
                            <v-text-field 
                                dense 
                                outlined
                                v-bind="attrs"
                                v-on="on"
                                type=number
                                :rules="[rules.positiveInteger, rules.gpudefault]"  
                                label="Number of GPUs per instance" 
                                v-model="serie.gpus"
                                @change="is_gpu_valid()"
                            >
                            </v-text-field>
                        </template>
                        <span v-if="nodeLimits.max_node_gpus">Your GPU quota limit is {{ Math.min(this.nodeLimits.max_node_gpus,this.userLimits.max_user_gpu)  }}</span>
                    </v-tooltip>
                    <label class="errorText"> {{gpuError}} </label>
                </v-col>
            </v-col>
        </v-row>
        
    </v-card>

</template>

<script>
    // import Vue from 'vue';
    import series from '@/utils/series.js'
    // api
    import DeconvolutionAPI from "@/api/DeconvolutionAPI.js"
    import PreferenceAPI from "@/api/PreferenceAPI"

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
                userLimits:[],
                nodeLimits:[],
                cpu: 0,
                gpu: 0,
                memError: null,
                gpuError: null,
                cpuError:null,
                message: null,
                inimem : 0,
                rules: {
                    positiveInteger: value => value && value > 0 && Number.isInteger(parseFloat(value)) || 'Must be a positive number',
                    memdefault: value => value && value >= 30 || 'Must be above or equal to the default value of 30 GB',
                    cpudefault: value => value && value >= 1 || 'Must be above or equal to the default value of 1 nodes',
                    gpudefault: value => value && value >= 1 || 'Must be above or equal to the default value of 1 gpu',
                },
                api:"",
                selectedtag: null,
                queueTime:"",
                /* positiveInteger: [
                    value => value && value > 0 && Number.isInteger(parseFloat(value)) || 'Must be a positive integer'
                ], 
                positiveNumber: [
                    value => value && value > 0 || 'Must be a positive number'
                ],  */
            }
        },
      
        methods: {
            // return the data
            get_serie(){
                return this.serie
            },
            async load_serie(serie_devices){
                this.serie = serie_devices
                this.inimem = this.serie.mem
                this.message = null
                let _current_api = await PreferenceAPI.get_config()
                this.api=_current_api.apiname
                this.selectedtag = _current_api.metadatatag
                this.getQueueTime()
                this.getUserLimits()
                

                
               
                
            },
            is_valid(){
                if(this.serie.instances && this.serie.instances >0
                    && this.serie.mem && this.serie.mem > 0 
                    && this.serie.gpus && this.serie.gpus > 0)
                    return true
                else
                    return false
            }, 
            /* is_cpu_valid(){
                if(this.serie.instances > Math.min(this.userLimits.max_user_cpu)) {
                    this.cpuError= this.serie.instances +" exceeds the user's maximum allowed CPU cores. Setting it to the default."
                    this.serie.instances = 1
                }else {
                    this.cpuError =null
                }

            }, */
            is_mem_valid(){
                
                if (this.cpu && this.serie.mem &&  this.cpu > 0 && this.serie.mem > 0 && this.cpu > Math.max(30,this.serie.mem)) {
                    this.memError = " Need "+ this.cpu + "GB memory: " + this.serie.mem + "GB is below estimate"
                    
                    if (this.cpu <= Math.min(this.nodeLimits.max_node_cpu_mem,this.userLimits.max_user_mem)) {
                        this.serie.mem = this.cpu
                        
                    }else {
                        this.memError = this.cpu+ " GB exceeds the user's allocated memory limit."
                       
                    }
                    
                } else {
                    if (this.cpu > 0 && this.cpu < Math.max(30,this.serie.mem) && this.serie.mem < Math.max(30,this.inimem)) {
                        this.serie.mem = Math.max(30,this.inimem)
                        
                    } 
                    this.memError = null 
                }
                if (this.serie.mem  > Math.min(this.nodeLimits.max_node_cpu_mem,this.userLimits.max_user_mem) ) {
                    
                    this.memError = this.serie.mem+ " GB exceeds the user's allocated memory limit. Setting it to the default"
                    this.serie.mem = 30
                }
                

            },
            is_gpu_valid(){
                if (this.gpu && this.gpu > 0 && this.gpu > 16 && this.serie.gpus < Math.ceil(this.gpu/16)) {
                    this.gpuError =  'Need '+ Math.ceil(this.gpu/16)+ ' GPUs: add more GPUs or enable tiling'
                    if(Math.ceil(this.gpu/16) <= Math.min(this.nodeLimits.max_node_gpus,this.userLimits.max_user_gpu) ){
                        this.serie.gpus = Math.ceil(this.gpu/16)
                    }else {
                        this.gpuError = Math.ceil(this.gpu/16)+ " exceeds the user's maximum allowable GPU allocation."
                    }
                }else {
                    this.gpuError = null
                }
                if (this.serie.gpus > Math.min(this.nodeLimits.max_node_gpus,this.userLimits.max_user_gpu) ) {
                    this.gpuError = this.serie.gpus+ " exceeds the user's maximum allowable GPU allocation. Setting it to the default"
                    this.serie.gpus = 1
                }
            },
          
            async estimateMemory() {
                let jobs = []
                
                if (!this.serie.filepath) {
                    this.serie.filepath = this.$cookies.isKey('filepath') ? this.$cookies.get('filepath') : 'none'
                }
                
                this.overlay =true
                this.loading=true
                
                let response = await DeconvolutionAPI.execute_microvolution(this.serie.outputPath, parseInt(this.serie.instances), 
                this.serie.mem, this.serie.gpus, this.serie, jobs, false, true, false)

                console.log("Estimate response")
                console.log(response)
                
                this.overlay =false
                this.loading=false
                this.message = ' Estimate complete'
                let output = response.commandResult
                console.log(output)
                
                if (output.length > 0) {
                    for (let i=0; i < output.length ; i++) {
                        if(output[i].out.startsWith("{\"estimates\":")){
                            let json_output =  JSON.parse(output[i].out)
                            this.estimates = json_output
                            
                            let cpuMem = this.estimates.estimates.cpuEstimateGB == 0 ? 1: this.estimates.estimates.cpuEstimateGB
                            let gpuMem = this.estimates.estimates.gpuEstimateGB == 0 ? 1 : this.estimates.estimates.gpuEstimateGB
                            this.cpu =  cpuMem + 5
                            this.gpu = gpuMem 
                            
                        }
                    }
                }
                this.is_mem_valid()
                this.is_gpu_valid()
               
            },
            async stopEstimate(){
                await DeconvolutionAPI.cancel_estimate()
                this.overlay =false
                this.loading=false
            },
            async getQueueTime() {
                let response = await DeconvolutionAPI.queue_time(1, 30, 1, 'gpu_cuda' , 'debug' )
                const responseString = response.commandResult[0].output
                const regex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
                const timeStampMatch = responseString.match(regex) 
                const startTime = timeStampMatch ? timeStampMatch[0]:null
                const queueTime = new Date(startTime)
                const timediffinms = queueTime - (new Date)
                const timediffinSec = Math.floor(timediffinms/1000)
                
                if (timediffinSec < 60) {
                        this.queueTime = "The resource estimates are expected to be generated in less than 1 minute"
                }else if (timediffinSec > 60 ){
                        this.queueTime = "The resource estimate will take more than 1 minute to generate."
                }
               
                

            },
            async getUserLimits(){
                let userLimitResponse =  await DeconvolutionAPI.user_limits()
                let output = userLimitResponse.commandResult
                const userlimits =  output.find(entry => entry.out.startsWith('{"user_limits"'))
                let json_output =  JSON.parse(userlimits.out)
                this.userLimits = json_output.user_limits
                this.nodeLimits = json_output.node_limits
                
            }

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
        color: red;
    }
    .messageText {
        margin-top: -20px;
        font-size: 14px;
        color: green;
        font-family: Roboto,sans-serif;
    }
</style>