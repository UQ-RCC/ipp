<template>
    <v-dialog v-model="dialog" persistent scrollable max-height="60%" max-width="50%">
        <v-card>
            <v-toolbar dark color="#49075e">
                <v-btn icon dark @click="cancel">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-card-title class="headline" >
                    Available Metadata
                </v-card-title>    
            </v-toolbar>

            <v-row >
                <v-col >
                    
                        <v-card-text>
                            <v-table fixed-header class="elevation-1">
                                <thead>
                                    <tr>
                                        <th class="text-left">Paramater</th>
                                        <th class="text-left">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(value, key) in options.metadata"
                                        v-bind:key="key">
                                        <td class="text-left">{{ key }} </td>
                                        <td>{{ value }}</td>
        
                                    </tr>
                                </tbody>
        
                            </v-table>
                        </v-card-text>    
                    
                </v-col>
            </v-row>

            <v-card-actions>
                <v-row align="center" justify="center">    
                <v-btn class="my-1" color="success" rounded dark large @click="agree"> 
                    Ok
                </v-btn>
                
                </v-row>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    // import series from "@/utils/series.js"
    //import JsonViewer from 'vue-json-viewer'
   // import 'vue-json-viewer/style.css'
    

    export default {
        name: 'MetadataDialog',
        /* components: {
            JsonViewer,
        }, */
        data() {
            return {
                dialog: false,
                name: '',
                isnew: false, 
                resolve: null,
                reject: null,
                templates: [],
                selectedTemplate: [],
                templateTableHeaders: 
                [
                    { text: 'Name', value: 'name' }
                ],
                options:{
                    metadata: [],
                    success: false,
                    cancelled: false,
                },
                metadata: {}
            }
        },
        methods: {
            async open(metedataResults) {
                this.dialog = true
                this.options.success = false
                this.options.metadata = metedataResults
                //let metadataKeys = Object.keys(metedataResults)
                //let vals = Object.keys(metedataResults)
                
                return new Promise((resolve, reject) => {
                    this.resolve = resolve
                    this.reject = reject
                });
            },
            async agree() {
                this.options.cancelled = false
                this.options.success = true
                
                this.resolve(this.options)
                this.dialog = false
            },
            cancel() {
                this.options.cancelled = true
                this.resolve(this.options)
                this.dialog = false
            },
            
            
           
        },
    }
</script>
<style>

</style>