<template>
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
</template>

<script>
    import Vue from 'vue'
    import axios from 'axios'
    import MetadataAPI from "@/api/MetadataAPI.js"
    
    export default {
        name: 'Metadata',
        
        data() {
            return {
                loading: false,
                
                tags: [],
                selectedtag: null,
                message: null,
                error: null,
                isError: false
                
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
        methods: {
            async validate(){
                let validate =true
                let confid =  this.selectedtag
                let files =""
                try{
                    const response= await MetadataAPI.execute_metedata_script(files, confid, validate)
                    Vue.notify({
                        group: 'datanotif',
                        type: 'success',
                        title: 'Submission',
                        text: this.selectedtag + ' sent for validation',
                        closeOnClick: true,
                        duration: 5000,
                    })
                    let output = response.commandResult
                    if (output.length > 0) {
                        let json_output =  JSON.parse(output[0].out)
                        console.log(json_output)
                        if(!json_output.results.success){
                           this.message = "Validation failed! " 
                           this.error = "Error details : "+ json_output.results.msg
                           this.isError = true
                             
                        } else {
                            this.isError = false
                            this.message = "Validation Succeeded!"
                        }
                    }
                    
                }
                catch(err) {
                    Vue.notify({
                        group: 'datanotif',
                        type: 'error',
                        title: 'Submission',
                        text: this.selectedtag  + ' :fail to send for validation, please try again',
                        closeOnClick: true,
                        duration: 10000,
                    })
                    
                } 
            }

        }

       
        
    }
</script>
<style>
</style>