<template>
    <div>
        <v-row align="center" justify="center">
            <v-col cols="12" sm="8" md="10" lg="12">

                <v-card max-height="100%" max-width="99%">
                    <br />
                    <v-progress-linear
                        color="primary accent-4"
                        indeterminate
                        rounded
                        height="4"
                        :active="loading"
                    ></v-progress-linear>
                    
    
                    <div >
                        <v-card-title align="start" justify="center">
                            Update metadata parser configuration
                        </v-card-title>
                        <v-row align="center" justify="center" class="mx-3">
                            <v-col cols="6" sm="3" md="4" lg="4">
                                
                                <div>
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-select v-on="on" v-bind="attrs"
                                                :items="tags"
                                                v-model="selectedtag"
                                                item-text="type"
                                                label="Metadata tag"
                                                return-object
                                            >
                                            </v-select>
                                        
                                        </template>
                                        <span>Select the GitHub tag of the metadata parser configuration from the list</span>
                                    </v-tooltip>
                                </div>
                            </v-col>
                        
                            <v-col cols="4" sm="3" md="4" lg="4">
                                <v-btn class="my-1" color="success" rounded dark large @click="validate"> 
                                        Validate
                                </v-btn>
                            </v-col>
                            
                        </v-row>
                        <v-row>
                                <v-card-text class="mt-4 ml-4">
                                    <p class="text-subtitle-2" :style="{color:!isError ? 'green' :'red'}">{{message}} </p>
                                    <p class ="text-body-2" v-if="isError"> {{ error }}</p>
                                </v-card-text>
    
    
                            </v-row>
    
                    </div>      
                    
                </v-card>
            </v-col>
        
        </v-row>
        <v-row>
            <v-col cols="12" sm="8" md="10" lg="12">

                <v-card max-height="100%" max-width="99%" >
                    <div >
                        <v-card-title align="start" justify="center">
                            Update Deconvolution API
                        </v-card-title>
                        <v-row align="center" justify="center" class="mx-3">
                            <v-col cols="6" sm="3" md="4" lg="4">
                                <v-radio-group v-model="api" row> 
                                    
                                    <v-radio
                                        label="Microvolution"
                                        value="Microvolution"
                                    ></v-radio>
                                    <v-radio
                                        label="CudaDecon"
                                        value="CudaDecon"
                                    ></v-radio>
                                </v-radio-group> 
                                    
                            </v-col>
                           
                            <v-col cols="4" sm="3" md="4" lg="4">
                                <v-btn class="my-1" color="success" rounded dark large @click="saveOption(true,false, api)" > 
                                        Save
                                </v-btn>
                            </v-col>
                            
                        </v-row>
                        <v-row>
                                <v-card-text class="mt-4 ml-4">
                                    <p class="text-subtitle-2" :style="{color:!isError ? 'green' :'red'}">{{messageSave}} </p>
                                    <p class ="text-body-2" v-if="isError"> {{ errorSave }}</p>
                                </v-card-text>
                        </v-row>
            
                    </div>
                </v-card>
            </v-col>

        </v-row>
       
</div>
</template>

<script>
    import Vue from 'vue'
    import axios from 'axios'
    import ConfigurationAPI from "@/api/ConfigurationAPI.js"
    import PreferenceAPI from "@/api/PreferenceAPI"
    
    export default {
        name: 'Metadata',
        
        data() {
            return {
                loading: false,
                
                tags: [],
                selectedtag: "meta_23_002",
                message: null,
                error: null,
                isError: false,
                api:"Microvolution",
                messageSave: null,
                errorSave:null,
                updated:null
                
                
                }
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
            const response = await  this.github.get("repos/uq-rcc/ipp-repo/git/refs/tags/meta_")
            if(response.data) {
                for (let i=0; i<response.data.length ; i++) {
                    let tagid = response.data[i].ref.split("/")[2]
                    this.tags.push(tagid)
                }
            }
        
        },

        mounted: async function () {
            let _current_api = await PreferenceAPI.get_config()
            this.api=_current_api.apiname
            this.selectedtag = _current_api.metadatatag
            this.updated = _current_api.updatedon

            console.log(this.api)
            console.log(this.selectedtag)
            console.log(this.updated)
            let utcdate= new Date(this.updated)
            const offsetMinutes = utcdate.getTimezoneOffset();
            let localtime = new Date(utcdate.getTime() - offsetMinutes * 60 * 1000)
            const localTimeString = localtime.toLocaleString()
            
            console.log(localTimeString)

        },

        methods: {
            async validate(){
                let validate =true
                let confid =  this.selectedtag
                let files =""
                let saveFolder =""
                console.log(confid)
                try{
                    const response= await ConfigurationAPI.execute_metedata_script(files, confid, validate, false, saveFolder)
                    console.log("metadata response")
                    console.log(response)
                    Vue.notify({
                        group: 'datanotif',
                        type: 'success',
                        title: 'Submission',
                        text: this.selectedtag + ' sent for validation',
                        closeOnClick: true,
                        duration: 5000,
                    })
                    let output = response.commandResult
                    console.log("metadata output")
                    console.log(output)
                    if (output.length > 0) {
                        const mdata = output.find(entry => entry.out.startsWith('{"params"'))
                        let json_output =  JSON.parse(mdata.out)
                        console.log(json_output)
                        if(!json_output.results.success){
                           this.message = "Validation failed! " 
                           this.error = "Error details : "+ json_output.results.msg
                           this.isError = true
                             
                        } else {
                            this.isError = false
                            this.message = "Validation Succeeded!"
                            this.saveOption(false, true, confid)
                        }
                    }
                    
                }
                catch(err) {
                    console.log("catch err")
                    console.log(err)
                    Vue.notify({
                        group: 'datanotif',
                        type: 'error',
                        title: 'Submission',
                        text: this.selectedtag  + ' :fail to send for validation, please try again',
                        closeOnClick: true,
                        duration: 10000,
                    })
                    
                } 
            },
            
            async saveOption(api, metadata, value) {
                try{
                    if (api) {

                        console.log(this.api)
                        console.log(this.selectedtag)
                        console.log("inside api update")
                        const response= await PreferenceAPI.save_config_data(value, this.selectedtag)
                        this.messageSave = "The API updated successfully!"
                        this.isError = false
                        console.log(response)
                    } else if (metadata){
                        console.log(value)
                        console.log(this.api)
                        const response= await PreferenceAPI.save_config_data(this.api, value)
                        console.log(response)
                    }
                }
                catch(err) {
                    this.errorSave = "The API update was unsuccessful"
                    Vue.$log.error(err)
                }
            }

        }

       
        
    }
</script>
<style>
</style>