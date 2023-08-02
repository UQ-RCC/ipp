<template>
    <div>
        <v-progress-linear color="primary accent-4" indeterminate rounded height="4" :active="loading"></v-progress-linear>
        <br />
        <file-browser-dialog ref="filedialog" />
        <v-row>
            <v-col cols="12" sm="12" md="4" lg="4" xl="4">
                <v-row>
                    <div class="text-center table-area">
                        <v-data-table v-model="selected" :items="loaded" :headers="selectedFilesTable.headers"
                            :single-select="true" :disable-pagination="true" item-key="path" show-select class="elevation-1"
                            height="300px" width="100%">
                        </v-data-table>

                        <div>
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn class="my-3" color="primary" fab dark large @click.stop="selectFiles()"
                                        v-bind="attrs" v-on="on">
                                        <v-icon>mdi-file-multiple</v-icon>
                                    </v-btn>
                                </template>
                                <span>Add single files</span>
                            </v-tooltip>


                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn class="my-3" color="primary" fab dark large v-bind="attrs" v-on="on"
                                        @click.stop="selectFilesInFolder()">
                                        <v-icon>mdi-folder-plus</v-icon>
                                    </v-btn>
                                </template>
                                <span>Add series (group of files with similar properties)</span>
                            </v-tooltip>

                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn class="my-3" color="warning" @click.stop="removeCurrentlySelected()" fab dark
                                        large v-bind="attrs" v-on="on">
                                        <v-icon>mdi-close</v-icon>
                                    </v-btn>
                                </template>
                                <span>Remove selected</span>
                            </v-tooltip>

                            <v-tooltip bottom>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn class="my-3" color="error" @click.stop="removeAll()" fab dark large
                                        v-bind="attrs" v-on="on">
                                        <v-icon>mdi-close-octagon</v-icon>
                                    </v-btn>
                                </template>
                                <span>Remove all</span>
                            </v-tooltip>
                        </div>
                    </div>

                </v-row>


                <v-row class="ml-2 mr-2">
                    <!--  <v-col cols="12"  sm="12" md="4" lg="4" xl="4"> -->

                    <v-text-field label="Output Base Path" hide-details="auto" v-model="outputBasePath" @change="valueChange()"></v-text-field>
                    <!-- </v-col> -->

                </v-row>

                <v-row class="ml-2 mr-2">


                    <v-text-field label="Output Folder Name" hide-details="auto" v-model="outputFolderName" @change="valueChange()" ></v-text-field>

                </v-row>
                <v-row>
                    <v-col>
                        <v-btn class="mx-1" color="primary" @click.stop="chooseOutputFolder" rounded dark large
                            title="Select where to save the outputs">
                            Choose Output Folder
                        </v-btn>
                    </v-col>
                    <v-col>
                        <v-btn class="mx-1" color="primary" title="Browse output folder in a new Window"
                            @click.stop="openOutputFolder" fab medium :disabled="!outputBasePath && !outputFolderName">
                            <v-icon>mdi-open-in-app</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
                <v-row>
                    <v-checkbox class="mx-4" v-model="emailNeeded" label="Email when the job is complete"></v-checkbox>
                </v-row>
            </v-col>
            <v-divider vertical></v-divider>

            <v-col cols="12" sm="12" md="8" lg="8" xl="8">

                <v-stepper v-model="curr" color="green" style="height: 800px">
                    <v-stepper-header>
                        <v-stepper-step v-for="(step, n) in steps" :key="n" :complete="stepComplete(n + 1)" :step="n + 1"
                            :color="stepStatus(n + 1)" :editable="checkStepVisibility(n + 1)" >
                            {{ step.name }}
                        </v-stepper-step>
                    </v-stepper-header>
                    <v-stepper-items>
                        <v-stepper-content step="1">
                            <div>
                                <v-row class="pa-4" color="text-h2 text-center">
                                    <v-col cols="6">
                                        <v-radio-group  v-model="workingItem.macroSource" @change="reset()" row> 
                                            <v-radio
                                                label="Github"
                                                value="1"
                                            ></v-radio>
                                            <v-radio
                                                label="File System"
                                                value="2"
                                            ></v-radio>
                                        </v-radio-group> 
                                    </v-col>
                                    <v-col cols="6">
                                        <v-select v-if="workingItem.macroSource =='1'" :items="ippModels" v-model="workingItem.macroType" item-text="ippLongName"
                                            item-value="id" label="Choose your macro:" @change="getMacro" outlined
                                            dense :rules="[rules.required]"></v-select>
    
                                        <v-btn  v-if="workingItem.macroSource =='2'" class="mx-1" color="primary" @click.stop="selectMacroFile()" rounded dark large
                                            title="Select macro script from the folder">
                                                Select File
                                        </v-btn>

                                       
                                    </v-col>
                                </v-row>
                                <v-row v-if="workingItem.macroSource =='2'">
                                    <v-col cols="12" sm="8" md="12">

                                        <v-text-field
                                            v-model="macrofile"
                                            label="File"
                                            ></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row v-show="workingItem.macroType || macrofile " >
                                    <v-col cols="12" sm="8" md="12">
                                        <v-card class="mb-12 pa-4" color="text-h2 text-center">
                                            <v-tabs fixed-tabs>
                                                <v-tab>Description</v-tab>
                                                <v-tab>Inputs</v-tab>
                                                <v-tab>Code <v-btn v-show="workingItem.macroSource =='1'" class="ms-15" icon @click="openGIT(url)">
                                                        <v-icon>mdi-github-circle</v-icon>
                                                    </v-btn></v-tab>


                                                <v-tab-item>
                                                    <v-card class="macro-info-card" style="height:300px">
                                                        <v-card-text class=" text-body-1 ">
                                                            <v-list>
                                                                <v-list-item v-for="(item, index) in workingItem.description" :key="index">

                                                                    <v-list-item-content>{{ item }}</v-list-item-content>
                                                                </v-list-item>
                                                            </v-list></v-card-text>
                                                    </v-card>
                                                </v-tab-item>
                                                <v-tab-item>
                                                    <v-card class="macro-info-card" style="height:300px">
                                                        <v-card-text>
                                                            <v-row class="mt-3 text-h6 " style="justify-content:center">This
                                                                macro requires {{ inputArr.length }} inputs :</v-row>
                                                            <v-row class="mt-6" style="justify-content:center">

                                                                <v-table fixed-header height="300px">
                                                                    <thead>
                                                                        <tr>
                                                                            <th class="text-left">Input</th>
                                                                            <th class="text-left">Data Type</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        <tr v-for="input in inputArr"
                                                                            v-bind:key="input.inputName">
                                                                            <td class="text-left">{{ input.inputName }} </td>
                                                                            <td>{{ input.dataType }}</td>

                                                                        </tr>
                                                                    </tbody>

                                                                </v-table>
                                                            </v-row>

                                                            <!-- <v-row class="mt-3" style="justify-content:center" v-for="input in inputArr" v-bind:key="input.input"> {{input.input}} - {{ input.dataType }} </v-row> -->
                                                        </v-card-text>
                                                    </v-card>
                                                </v-tab-item>
                                                <v-tab-item>
                                                    <v-card class="macro-info-card" style="height:300px">
                                                        <v-card-text>
                                                            <v-list>
                                                                <v-list-item v-for="(item, index) in code" :key="index">

                                                                    <v-list-item-content>{{ item }}</v-list-item-content>
                                                                </v-list-item>
                                                            </v-list>

                                                        </v-card-text>

                                                    </v-card>
                                                </v-tab-item>
                                            </v-tabs>

                                        </v-card>
                                    </v-col>
                                </v-row>

                            </div>
                        </v-stepper-content>
                        <v-stepper-content step="2">
                            <v-card class="macro-info-card" color="text-h2 text-center">
                                <div>
                                    <v-row align="center" justify="center">
                                        <v-col cols="40" sm="7" md="9" class="mt-4">
                                            <v-tooltip right v-for="input in inputArr" v-bind:key="input.inputName">
                                                <template v-slot:activator="{ on, attrs }" >
                                                    <v-text-field v-if="input.inputType ==='text'" dense outlined v-bind="attrs" v-on="on"
                                                        :label="`${input.inputName[0].toUpperCase() + input.inputName.substring(1)}`"
                                                        :hint="`${input.dataType}`" v-model="params[input.inputName]" :rules="[rules.required]" @keyup="validateInput(input.dataType,params[input.inputName])">
                                                    </v-text-field>
                                                    <v-select v-if="input.inputType ==='listBox'" :items="input.options" v-model="params[input.inputName]" 
                                                         :label="`${input.inputName[0].toUpperCase() + input.inputName.substring(1)}`" outlined
                                                        dense :rules="[rules.required]"></v-select>
                                                    <v-radio-group v-if="input.inputType.includes('radioButton')" v-model="params[input.inputName]" :label="`${input.inputName[0].toUpperCase() + input.inputName.substring(1)}`" row>
                                                        <v-radio v-for="radio in input.options" class="mx-4" :label="`${radio}`" :value="`${radio}`" v-bind:key="radio"></v-radio>
                                                    </v-radio-group>
                                                </template>
                                                <span>Enter {{ input.dataType }} value</span>
                                            </v-tooltip>
                                        </v-col>
                                    </v-row>

                                </div>
                            </v-card>

                        </v-stepper-content>
                        <v-stepper-content step="3">
                            <!-- <deconvolution-devices ref="decondevices" :readonly="true" /> -->
                            <v-card class=" macro-info-card" color="text-h2 text-center">
                                <div>
                                    <v-row align="center" justify="center">
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
                                                            v-model="workingItem.instances"
                                                            readonly
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
                                                            :rules="[rules.positiveInteger]"  
                                                            label="Memory per instance[node]" 
                                                            v-model="workingItem.mem"
                                                        >
                                                        </v-text-field>
                                                    </template>
                                                    <span>The amount of memory (in Gbs) for each instance</span>
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
                                                            :rules="[rules.positiveInteger]"  
                                                            label="Number of GPUs per instance[node]" 
                                                            v-model="workingItem.gpus"
                                                            readonly
                                                        >
                                                        </v-text-field>
                                                    </template>
                                                    <span>The number of GPUs to be used for each instance</span>
                                                </v-tooltip>
                                            </v-col>
                                        </v-col>
                                    </v-row>

                                </div>
                            </v-card>
                        </v-stepper-content>
                        <v-stepper-content step="4">
                            <v-card  color="text-h2 text-center">
                                <div>
                                    <v-expansion-panels accordion>
                                        <v-expansion-panel>
                                            <v-expansion-panel-header>Files & Macros</v-expansion-panel-header>
                                            <v-expansion-panel-content class="review-card">

                                                <p>{{ workingItem.fileName }} - {{ workingItem.description }}</p>

                                            </v-expansion-panel-content>
                                        </v-expansion-panel>

                                        <v-expansion-panel>
                                            <v-expansion-panel-header>Inputs</v-expansion-panel-header>
                                            <v-expansion-panel-content class="review-card">
                                                <v-card>
                                                    <div>
                                                        <v-row align="center" justify="center">
                                                            <v-col cols="30" sm="6" md="7" class="mt-4">
                                                                <v-row v-for="(item, index) in params" :key="index">
                                                                    <v-text-field :value="`${item}`" :label="`${index}`"
                                                                    dense 
                                                                    outlined readonly></v-text-field>
                                                                </v-row>
                                                            </v-col>
                                                        </v-row>
                                                    </div>
                                                </v-card>
                                            </v-expansion-panel-content>
                                        </v-expansion-panel>

                                        <v-expansion-panel>
                                            <v-expansion-panel-header>Devices</v-expansion-panel-header>
                                            <v-expansion-panel-content class="review-card">
                                                <v-card>
                                                    <div>
                                                        <v-row align="center" justify="center">
                                                            <v-col cols="30" sm="6" md="7" class="mt-4">
                                                                <v-row>
                                                                    <v-text-field :value="`${workingItem.instances}`" label="Number of instances [nodes]"
                                                                    dense 
                                                                    outlined readonly></v-text-field>
                                                                </v-row> 
                                                                <v-row>
                                                                    <v-text-field :value="`${workingItem.mem}`" label="Memory per instance[node]"
                                                                    dense 
                                                                    outlined readonly></v-text-field>
                                                                </v-row> 
                                                                <v-row>
                                                                    <v-text-field :value="`${workingItem.gpus}`" label="Number of GPUs per instance[node]"
                                                                    dense 
                                                                    outlined readonly></v-text-field>
                                                                </v-row> 
                                                            </v-col>
                                                        </v-row>
                                                    </div>
                                                </v-card>

                                            </v-expansion-panel-content>
                                        </v-expansion-panel>

                                    </v-expansion-panels>

                                </div>
                            </v-card>
                          

                        </v-stepper-content>

                    </v-stepper-items>
                </v-stepper>
                <div class="buttons-margin" />
                <div class="buttons-extra-margin" />
                <v-row class="d-flex" v-bind:style="{ margin: '10px' }">
                    <v-tooltip top v-if="curr != 1">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn fab dark small color="primary" @click.stop="previousStep" v-bind="attrs" v-on="on">
                                <v-icon dark>
                                    mdi-chevron-left
                                </v-icon>
                            </v-btn>
                        </template>
                        <span>Previous step</span>
                    </v-tooltip>
                    <v-spacer></v-spacer>
                    <v-tooltip top v-if="curr == 4">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn color="primary" rounded dark default v-bind="attrs" v-on="on"
                                @click.stop="submitSelected()">
                                Submit
                            </v-btn>
                        </template>
                        <span>Submit the selected macro file</span>
                    </v-tooltip>
                    <v-spacer></v-spacer>
                    <v-tooltip top v-if="curr != 4">
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn fab dark small color="primary" @click.stop="nextStep" v-bind="attrs" v-on="on">
                                <v-icon darkd>
                                    mdi-chevron-right
                                </v-icon>
                            </v-btn>
                        </template>
                        <span>Next step</span>
                    </v-tooltip>
                </v-row>
            </v-col>
        </v-row>
    </div>
</template>
<script>

import Vue from 'vue'
import Vuetify from 'vuetify'
import FileBrowserDialog from '@/components/FileBrowserDialog.vue'
//api
import PreferenceAPI from "@/api/PreferenceAPI"
import axios from 'axios'
import DeconvolutionAPI from "@/api/DeconvolutionAPI.js"
//import macro from '@/utils/macroDefs'
//import DeconvolutionDevices from '@/components/deconvolution/Devices.vue'

import MacroAPI from "@/api/MacroAPI.js"
import miscs from '@/utils/miscs.js'
//import DeconvolutionMetadata from '@/components/deconvolution/Metadata.vue'
Vue.use(Vuetify)
export default {
    name: 'Macros',
    components: {
        FileBrowserDialog,
        //DeconvolutionDevices,

        //DeconvolutionMetadata
    },
    data() {
        var data = {
            loading: false,
            selectedFilesTable: {
                headers: [
                    { text: 'Name', value: 'path' }
                ],
            },
            selected: [],
            loaded: [],
            outputBasePath: "",
            outputFolderName: "",
            dbinfo: {},
            emailNeeded: true,
            curr: 1,
            lastStep: 3,
            steps: [
                { name: "Files & Macros" , rules: [v => !!v || "Select a macro file."], valid: true},
                { name: "Input Parameters", rules: [v => !!v || "Required."], valid: true },
                { name: "Devices", rules: [v => !!v || "Required."], valid: true },
                { name: "Review" },

            ],
            valid: false,
            stepForm: [],
            macros: {},
            workingItem: {},
            tab: null,
            description: '',
            code: '',
            url: '',
            github: '',
            inputArr: [],
            params: {},
            download_url: '',
            rules: {
                    required : value => !!value || "The input is required",
                    positiveNumber: value => value > 0 || 'Must be zero or greater',
                    positiveInteger: value => value && value >= 0 && Number.isInteger(parseFloat(value)) || 'Must be a positive integer',
                },
            visitedSteps: [],
            dateTime:"",
            source:[
                {label:'Github', value:1},
                {label:'Local File System', value:2}
            ],
            macrofile:'',



        }
        return data

    },
    created: async function () {
        const GitHubClient = axios.create({
            method: 'get',
            baseURL: Vue.prototype.$Config.github.baseURL,
            headers: {
                'Authorization': Vue.prototype.$Config.github.AuthToken,
            }
        })
        this.github = GitHubClient
        const response = await  this.github.get("repos/UQ-RCC/ipp-repo/contents/macros/macroDefs.json")
        if(response.data) {
            const macrodef = JSON.parse(atob(response.data.content))
            this.macros = macrodef
        }
        
    },
    computed: {
        username: function () {
            return this.$keycloak && this.$keycloak.idTokenParsed ? this.$keycloak.idTokenParsed.preferred_username : ''
        },
        stepperProgress() {
            return (100 / 3) * (this.step - 1) + '%'
        },
        ippModels() {
            const obj = this.macros
            const resultArray = Object.keys(obj).map(function (key) {
                return obj[key]
            })
            return resultArray
        },
        

    },
    methods: {
        
        async chooseOutputFolder() {
            let options = await this.$refs.filedialog.open('selectfolder', 'Preprocessing', '/')
            if (!options.cancelled && options.path) {
                var selectedFolder = options.path
                Vue.$log.debug("selected folder:" + selectedFolder)
                if (selectedFolder.endsWith('/'))
                    selectedFolder = selectedFolder.slice(0, -1)
                var _pathParts = selectedFolder.split("/")
                this.outputBasePath = _pathParts.slice(0, -1).join("/")
                this.outputFolderName = _pathParts.slice(-1)[0]
                //this.saveToDb()
            }
        },
        // open folder
        openOutputFolder() {
            if (this.outputBasePath && !this.outputBasePath.endsWith("/"))
                this.outputBasePath = this.outputBasePath + "/"
            let outputPath = this.outputBasePath + this.outputFolderName
            if (!outputPath.endsWith("/"))
                outputPath = outputPath + "/"
            let route = this.$router.resolve({ path: '/' })
            let url = route.href + "?component=filesmanager&path=" + outputPath
            Vue.$log.info(url)
            window.open(url, '_blank')
        },
        async nextStep() {
            

            if (this.curr === 1) {
                if ((this.workingItem.macroSource=='1' && !this.workingItem.macroType) || (this.workingItem.macroSource=='2' && this.macrofile=='') ||(!this.workingItem.macroSource)) {
                    Vue.notify({
                                    group: 'errornotif',
                                    type: 'error',
                                    title: 'Input Error',
                                    text: "Please select a macro file to proceed",
                                    closeOnClick: true
                                })
                    return
                } else{
                        if (this.inputArr.length > 0) {
                            
                            
                            for (let i = 0; i < this.inputArr.length; i++) {
                                console.log(this.inputArr[i])
                                if (this.inputArr[i].inputName === "input") {
                               // this.params.input = this.selected[0].path
                                    this.params.input = this.outputBasePath
                                }
                                if (this.inputArr[i].inputName === "output") {
                                    if (this.outputBasePath && !this.outputBasePath.endsWith("/"))
                                        this.outputBasePath = this.outputBasePath + "/"
                                    this.params.output = this.outputBasePath + this.outputFolderName
                                }
                                if(this.inputArr[i].default){
                                    this.params[this.inputArr[i].inputName] = this.inputArr[i].default    
                                }

                            }
                        }
                    
                } 
                
                
            }
            if (this.curr === 2) {
                
                if (Object.keys(this.params).length !== this.inputArr.length) {
                    Vue.notify({
                                    group: 'errornotif',
                                    type: 'error',
                                    title: 'Input Error',
                                    text: "Please input values for all the parameters",
                                    closeOnClick: true
                                })
                    return

                } else {
                    
                    this.dbinfo = await PreferenceAPI.get_macro()
                    this.workingItem.params = this.params
                    this.workingItem.instances = this.workingItem.instances ?? 1
                    this.workingItem.mem = this.workingItem.mem ?? 100
                    this.workingItem.gpus = this.workingItem.gpus ?? 1
                    
                }

            }
            if (this.curr === 3) {
                let msg 
                let jobs = this.workingItem.instances
                let mem = this.workingItem.mem
                let gpus = this.workingItem.gpus
                let settings=[]
                let response = await DeconvolutionAPI.validate_devices(jobs,mem,gpus,settings)
                let output = response.commandResult
                if (output.length > 0) {
                    let json_output =  JSON.parse(output[0].out)
                    if(!json_output.results.success){
                        let limit_test =  json_output.results.limits_test.success
                        let slurm_test = json_output.results.slurm_test.success
                        if (!limit_test && !slurm_test || !limit_test && slurm_test){
                            msg = json_output.results.limits_test.msg
                        }
                        else if (limit_test && !slurm_test) {
                            msg = json_output.results.slurm_test.msg
                        }
                        Vue.notify({
                            group: 'errornotif',
                            type: 'error',
                            title: 'Device Selection Error',
                            text: msg.charAt(0).toUpperCase() + msg.slice(1)
                        })
                        return 
                    }
                }
                

            } 
            if(this.visitedSteps.indexOf(this.curr) < 0)
                this.visitedSteps.push(this.curr)
            this.curr = this.curr + 1
            this.saveToDb()
        },
        previousStep() {
            this.curr = this.curr - 1
        },

        valueChange() {
            this.dbinfo.outputPath = this.outputBasePath + this.outputFolderName
            this.params.output = this.dbinfo.outputPath
            if(this.workingItem.params) {
                this.workingItem.params.output = this.params.output
            }
           

        },

        reset() {
            this.workingItem.macroType =''
            this.macrofile=''
        },

        

        async getMacro() {
            //let scriptLines = []
            //let input_params = []
            for (let i = 0; i < this.macros.length; i++) {
                if (this.workingItem.macroType === this.macros[i].id) {
                    this.workingItem.description = this.macros[i].description.split("\n")
                    this.workingItem.fileName = this.macros[i].fileName
                }
            }

           await this.github.get("/repos/UQ-RCC/ipp-repo/contents/macros/" + this.workingItem.fileName).then((response) => {
               
                this.url = response.data.html_url
                this.download_url = response.data.download_url
                const lines = atob(response.data.content).split("\n")
                this.readMacroScript(lines)


                /* for (let i = 0; i < lines.length; i++) {
                    
                    if(lines[i].startsWith("#@") && lines[i].indexOf('(') > 0){
                        let substring1 = lines[i].substring(2, lines[i].indexOf('(')).trim()
                        let substring2 = lines[i].substring(lines[i].indexOf('('), lines[i].lastIndexOf(')')+1).trim()
                        let substring3 = lines[i].substring(lines[i].indexOf(')')+1).trim()
                        let params = []
                        params.dataType = substring1
                        console.log(substring2)

                        substring2 = substring2.replace('{', '[').replace('}',']').replaceAll('=',':')

                        String.prototype.replaceAt = function(index, replacement) {
                            return this.substring(0, index) + replacement + this.substring(index + replacement.length);
                        }

                        substring2 = substring2.replaceAt(substring2.indexOf('('),'{').replaceAt(substring2.lastIndexOf(')'),'}')
                        console.log(substring2);


                        if(substring2.includes("choices")){
                            substring2 = substring2.replace("choices",JSON.stringify("choices"))
                        }if(substring2.includes("style")) {
                            substring2 = substring2.replace("style",JSON.stringify("style"))
                        }if(substring2.includes("value")) {
                            substring2 = substring2.replace("value",JSON.stringify("value"))
                        }
                        substring2 = JSON.parse(substring2)
                        
                        if(substring2.style){
                            params.inputType = substring2.style
                        }
                        else{
                            params.inputType = "text"
                            }
                        if(substring2.choices) {
                            params.options = substring2.choices
                        }
                        if(substring2.value)
                            params.default = substring2.value
                        
                        params.inputName = substring3
                    
                        input_params.push(params)
                        console.log(input_params)

                    }else if (lines[i].startsWith("#@")) {
                        let arr = lines[i].replace("#@", "").trim().split(" ")
                        let params = []
                        params.dataType = arr[0]
                        params.inputName = arr[1]
                        params.inputType = "text"
                        console.log(params)
                        input_params.push(params)
                    }
                    if (lines[i] !== "") {
                        
                        scriptLines.push(lines[i])
                    }


                }
                console.log(scriptLines)
                this.code = scriptLines
                this.inputArr = input_params */
            });


        },
        async copyMacroFile(outputFolder) {
            let islocal
            let commitId
            if(this.workingItem.macroSource == '1') {
                islocal = false
                
                const response = await this.github.get("repos/UQ-RCC/ipp-repo/commits/main")
                if(response.data){
                    commitId = response.data.sha.substring(0,7)
                }
                console.log(commitId)
    
                if (this.workingItem.fileName && outputFolder ) {
                    try{
                        console.log(outputFolder)
                        console.log(this.workingItem.fileName)
                        await MacroAPI.saveFile(this.workingItem.fileName, outputFolder, commitId, islocal)
                        Vue.notify({
                            group: 'sysnotif',
                            type: 'info',
                            title: 'Save Macro File',
                            text: this.workingItem.fileName + ' saved!'
                        });
                        this.$emit("file saved", this.workingItem.fileName);
                    }
                    catch(err){
                        Vue.notify({
                            group: 'sysnotif',
                            type: 'error',
                            title: 'Save Macro File',
                            text: 'Fail to save ' + this.workingItem.fileName  + ' .Error:' + String(err)
                        });
                        console.log(String(err))
                    } 
    
                } 
            }else if(this.workingItem.macroSource == '2') {
                islocal = true
                commitId = ''
                if (this.macrofile && outputFolder) {
                    try {
                        console.log(outputFolder)
                        console.log(this.macrofile)
                        await MacroAPI.saveFile(this.macrofile, outputFolder, commitId, islocal)
                        Vue.notify({
                            group: 'sysnotif',
                            type: 'info',
                            title: 'Save Macro File',
                            text: this.workingItem.fileName + ' saved!'
                        });
                        this.$emit("file saved", this.workingItem.fileName);
                    }
                    catch(err){
                        Vue.notify({
                            group: 'sysnotif',
                            type: 'error',
                            title: 'Save Macro File',
                            text: 'Fail to save ' + this.workingItem.fileName  + ' .Error:' + String(err)
                        });
                        console.log(String(err))
                    } 
                }

            }



        },
       
        stepComplete(step) {
            return this.curr > step
        },
        stepStatus(step) {
            return this.curr > step ? 'green' : 'blue'
        },
        validate(n) {
            this.steps[n].valid = false
            let v = this.$refs.stepForm[n].validate()
            if (v) {
                this.steps[n].valid = true
                // continue to next
                this.curr = n + 2
            }
        },
        validateInput(dataType, input){
            let dt= 'String'
            const format = /[`!@#$%^&*'()+=|,<>?~]/;
            if(dataType.toUpperCase === dt.toUpperCase) {
                if (format.test(input)) {
                    Vue.notify({
                                    group: 'errornotif',
                                    type: 'error',
                                    title: 'Input Error',
                                    text: "Special characters are not allowed",
                                    closeOnClick: true
                                })
                    return

                }
            }


        },
        checkStepVisibility(step) {
            if (this.visitedSteps.indexOf(step)  >= 0)
                return true
            else
                return false
        },
        done() {
            this.curr = 5
        },
        openGIT(url) {
            window.open(url, '_blank', 'noreferrer')
        },
        async selectedChanged(anItem) {
            Vue.$log.debug("Selected changed")
            Vue.$log.info(anItem)
            // if selected, load it
            anItem.item.selected = anItem.value
            if (anItem.value) {
                this.selected = [anItem.item]
                this.workingItem = this.selected[0]
                Vue.$log.info(this.workingItem)
            } else {
                // save this working item
                //await PreferenceAPI.save_psetting(this.workingItem)
                console.log(this.workingItem)
            }
        },
        /**
        * called when select single files
        */
        async selectFiles() {
            await this.selectFilesOrFolders(false)
        },
        /**
         * select series
         */
        async selectFilesInFolder() {
            await this.selectFilesOrFolders(true)
        },

        // remove item
        async removeCurrentlySelected() {
            Vue.$log.info("Removing currently seleced item")
            this.selected.forEach(item => {
                for (let i = 0; i < this.loaded.length; i++) {
                    if (this.loaded[i].path === item.path) {
                        this.loaded.splice(i, 1)
                    }
                }
            })
            this.selected = []
            if (this.loaded.length == 0) {
                this.outputFolderName = ""
                this.outputBasePath = ""
                //this.dbinfo.maxsize = 0
            }
            this.saveToDb()
        },
        // remove all
        async removeAll() {
            this.loaded = []
            this.selected = []
            this.outputFolderName = ""
            this.outputBasePath = ""
            //this.dbinfo.maxsize = 0
            this.saveToDb()
        },

        async selectMacroFile(){
            let options = null
            options = await this.$refs.filedialog.open('selectfiles', 'Preprocessing', '/')
            let paths =[]
            if(!options.cancelled) {
                console.log(options)
                console.log(options.selectedItems)
                for(let i =0; i < options.selectedItems.length; i++){
                    let itemSize = miscs.convertFormattedStrToBytes(options.selectedItems[i].size)
                    if (itemSize * 2.2 > miscs.maxMemSize()) {
                        Vue.notify({
                            group: 'sysnotif',
                            type: 'warning',
                            title: 'Unable to add file',
                            text: 'This macro require too much memory to run! This macro cannot be added'
                        })
                        return
                    }
                    paths.push({ 'path': options.selectedItems[i].path, 'size': itemSize })
                    console.log(paths)
                }
                if (paths.length === 0) {
                    Vue.$log.debug("Paths is empty. Return.")
                    return
                }
                if(paths[0].path) {
                    this.macrofile = paths[0].path
                    let macrofilename = paths[0].path.split("/").slice(-1)
                    this.workingItem.fileName = macrofilename[0]
                    let extension = macrofilename[0].split(".").pop()
                    if(extension == "ijm") {
                        let _readMacroResponse = await MacroAPI.readMacroFile(this.macrofile)
                        if(_readMacroResponse.commandResult.length > 0) {
                            let notice = "Description is not available for the macros selected from the file system"
                            this.workingItem.description = notice.split("\n")
                            let content= atob(_readMacroResponse.commandResult[0].output)
                            let lines = content.split("\n")
                            this.readMacroScript(lines)
                            
                        }
                    }
                    else{
                        Vue.notify({
                            group: 'sysnotif',
                            type: 'warning',
                            title: 'Incorrect file type',
                            text: 'Please select a valid macro file!'
                        })
                        return

                    }
                }
                
            }
        },

        readMacroScript(lines){
            let input_params = []
            let scriptLines = []
            for (let i = 0; i < lines.length; i++) {
                    
                if(lines[i].startsWith("#@") && lines[i].indexOf('(') > 0){
                    let substring1 = lines[i].substring(2, lines[i].indexOf('(')).trim()
                    let substring2 = lines[i].substring(lines[i].indexOf('('), lines[i].lastIndexOf(')')+1).trim()
                    let substring3 = lines[i].substring(lines[i].indexOf(')')+1).trim()
                    let params = []
                    params.dataType = substring1
                    console.log(substring2)

                    substring2 = substring2.replace('{', '[').replace('}',']').replaceAll('=',':')

                    String.prototype.replaceAt = function(index, replacement) {
                        return this.substring(0, index) + replacement + this.substring(index + replacement.length);
                    }

                    substring2 = substring2.replaceAt(substring2.indexOf('('),'{').replaceAt(substring2.lastIndexOf(')'),'}')
                    console.log(substring2);


                    if(substring2.includes("choices")){
                        substring2 = substring2.replace("choices",JSON.stringify("choices"))
                    }if(substring2.includes("style")) {
                        substring2 = substring2.replace("style",JSON.stringify("style"))
                    }if(substring2.includes("value")) {
                        substring2 = substring2.replace("value",JSON.stringify("value"))
                    }
                    substring2 = JSON.parse(substring2)
                    
                    if(substring2.style){
                        params.inputType = substring2.style
                    }
                    else{
                        params.inputType = "text"
                        }
                    if(substring2.choices) {
                        params.options = substring2.choices
                    }
                    if(substring2.value)
                        params.default = substring2.value
                    
                    params.inputName = substring3
                
                    input_params.push(params)
                    console.log(input_params)

                }else if (lines[i].startsWith("#@")) {
                    let arr = lines[i].replace("#@", "").trim().split(" ")
                    let params = []
                    params.dataType = arr[0]
                    params.inputName = arr[1]
                    params.inputType = "text"
                    console.log(params)
                    input_params.push(params)
                }
                if (lines[i] !== "" || lines[i] !== "\t") {
                    scriptLines.push(lines[i])
                }


            }
            console.log(scriptLines)
            this.code = scriptLines
            this.inputArr = input_params
        },

        /**
         * a common function; to be called by selectFiles, selectFilesInFolders
         */
        async selectFilesOrFolders(isfolder) {
            let options = null
            if (isfolder)
                options = await this.$refs.filedialog.open('selectfilesinfolder', 'Preprocessing', '/')
            else
                options = await this.$refs.filedialog.open('selectfiles', 'Preprocessing', '/')
            if (!options.cancelled) {
                let paths = []
                if (isfolder) {
                    let _pathToBeLoaded = options.path + options.filter
                    Vue.$log.debug("selecting series:" + _pathToBeLoaded + " max size:" + options.maxsize)
                    let _exist = false
                    this.loaded.map(file => {
                        if (file.path === _pathToBeLoaded)
                            _exist = true
                    })
                    if (_exist)
                        return
                    if (options.maxsize * 2.2 > miscs.maxMemSize()) {
                        Vue.notify({
                            group: 'sysnotif',
                            type: 'warning',
                            title: 'Unable to add file',
                            text: 'This series require too much memory to run! This series cannot be added'
                        })
                        return
                    }
                    paths.push({ 'path': _pathToBeLoaded, 'size': options.maxsize })
                    
                } else {
                    Vue.$log.debug("selecting files:")
                    Vue.$log.debug(options.selectedItems)
                    for (let i = 0; i < options.selectedItems.length; i++) {
                        let _exists = false
                        this.loaded.map(file => {
                            if (file.path === options.selectedItems[i].path)
                                _exists = true
                        })
                        if (!_exists) {
                            let itemSize = miscs.convertFormattedStrToBytes(options.selectedItems[i].size)
                            if (itemSize * 2.2 > miscs.maxMemSize()) {
                                Vue.notify({
                                    group: 'sysnotif',
                                    type: 'warning',
                                    title: 'Unable to add file',
                                    text: 'This series require too much memory to run! This series cannot be added'
                                })
                                return
                            }
                            
                            paths.push({ 'path': options.selectedItems[i].path, 'size': itemSize })
                        }
                    }
                }
                // if paths empty return
                if (paths.length === 0) {
                    Vue.$log.debug("Paths is empty. Return.")
                    return
                }
                else {
                    Vue.$log.debug("Paths is not empty. Start loading.")
                    Vue.$log.debug(paths)
                }

                if (this.loaded.length === 0) {
                    this.outputFolderName = "Macro_Output_"+ this.dateTime
                    this.outputBasePath = paths[0].path.split("/").slice(0, -1).join("/")
                }
                this.loaded = this.loaded.concat(paths)
                if ((!this.selected || this.selected.length == 0) && this.loaded.length > 0) {
                    this.selected = [this.loaded[0]]
                }
                console.log(this.loaded)
                console.log(this.selected)
            }
            //this.saveToDb()
        },

        // save to db
        async saveToDb() {

            this.dbinfo.inputPaths = []
            this.loaded.map(item => {
                this.dbinfo.inputPaths.push(item.path)
            })
            if (this.outputBasePath && !this.outputBasePath.endsWith("/"))
                this.outputBasePath = this.outputBasePath + "/"
            this.dbinfo.outputPath = this.outputBasePath + this.outputFolderName
            if (this.workingItem) {
                this.dbinfo.inputs = []
                this.dbinfo.inputs.fileName = this.workingItem.fileName
                this.dbinfo.inputs.params = this.workingItem.params
                this.dbinfo.inputs = Object.assign({}, this.dbinfo.inputs)
                this.dbinfo.instances = this.workingItem.instances
                this.dbinfo.mem = this.workingItem.mem
                this.dbinfo.gpus = this.workingItem.gpus
                
            }
            if (this.username)
                this.dbinfo.username = this.username
            console.log(this.dbinfo)
            //TODO here
            if (this.dbinfo.id) {
                await PreferenceAPI.update_macro(this.dbinfo.id, this.dbinfo)
            }
            else {
                await PreferenceAPI.create_new_macro(this.dbinfo)
            }
        },

        async submitSelected() {
            this.saveToDb()
            if(this.params.output !== this.dbinfo.outputPath ) {
                this.dbinfo.outputPath = this.params.output

            }
            await this.copyMacroFile(this.dbinfo.outputPath)
            //create job:
            let _job = await PreferenceAPI.create_macro_job(this.dbinfo.id, this.emailNeeded)
            let args = this.dbinfo.inputs.params
            let files = this.dbinfo.inputPaths
            let keys = Object.keys(args)
            let vals = Object.values(args)
            let inputString = ""
            for (let i=0 ; i< Object.keys(args).length; i++ ) {
                inputString = inputString + keys[i]+"='"+vals[i]+"',"
            }
            inputString = inputString.substring(0,inputString.length-1)

            let macrosfilepath = this.dbinfo.outputPath+"/"+this.dbinfo.inputs.fileName
            
            let macroinfo = {}
            macroinfo.inputString = inputString
            macroinfo.jobId = _job.id
            macroinfo.filepath = macrosfilepath
            macroinfo.files = files
            macroinfo.args = args
            
       
            try{
                await MacroAPI.execute_macro_script(this.dbinfo.outputPath, parseInt(this.dbinfo.instances), this.dbinfo.mem, this.dbinfo.gpus, macroinfo) 
                Vue.notify({
                        group: 'datanotif',
                        type: 'success',
                        title: 'Submission',
                        text: this.dbinfo.inputs.params.input + ' :job sent',
                        closeOnClick: true,
                        duration: 5000,
                    })
            } 
            catch(err) {
                    Vue.$log.error("-----error submittin-----------")
                    Vue.$log.error(err)
                    await PreferenceAPI.delete_job(_job.id)
                    Vue.notify({
                        group: 'datanotif',
                        type: 'error',
                        title: 'Submission',
                        text: this.dbinfo.inputs.params.input + ' :fail to send jobs, please try again',
                        closeOnClick: true,
                        duration: 10000,
                    })
                    
            } 
            //window.location.reload();
            this.$router.go(0)
        }




    },
    mounted: async function () {
        let today = new Date();
        let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        this.dateTime = date+'_'+time;
                    
        // load from db
        try {
            //let convertpage = await PreferenceAPI.get_convertpage()
            this.dbinfo = await PreferenceAPI.get_macro()
            if (!this.dbinfo) {
                this.dbinfo = {}
                this.selected = []
                this.workingItem = {}
            }
            console.log(this.dbinfo)
        }
        catch (err) {
            Vue.$log.error(err)
            this.dbinfo = {}
        }// end catch 
        // convert to data

        if (this.dbinfo.inputPaths && this.dbinfo.inputPaths.length > 0) {
            this.dbinfo.inputPaths.map(path => {
                this.loaded.push({ 'path': path })
            })
            this.selected = [this.loaded[0]]
        }
        console.log(this.loaded)
        console.log(this.selected)

        // output path
        if (!this.dbinfo.outputPath)
            this.dbinfo.outputPath = ""
        var _pathParts = this.dbinfo.outputPath.split("/")
        this.outputBasePath = _pathParts.slice(0, -1).join("/")
        this.outputFolderName = "Macro_Output_"+ this.dateTime
        

       



    },
    

}
</script>
<style lang="scss">
@import "./public/styles/uq/scss/stepper_component.scss";

.macro-info-card {
    height:450px;
    min-height: 400px;
    max-height: 500px;
    min-width: 75%;
    max-width: 95%;
    overflow-y: auto;

}

.review-card {
    max-height: 200px;
    font-size: 14px;
    overflow-y: auto;

}

.table-area {
    height: 500px;
    max-width: 95%;

    .scroll-x {
        overflow-x: auto;
    }

    .scroll-y {
        overflow-y: auto;
    }
}
</style>