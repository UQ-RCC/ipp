<template>
    <v-dialog v-model="dialog" persistent scrollable max-height="60%" max-width="50%">
        <v-card>
            <v-toolbar dark color="#49075e">
                <v-btn icon dark @click="cancel">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-card-title class="headline" v-if="!isnew">
                    Load an existing template
                </v-card-title>
                <v-card-title class="headline" v-if="isnew">
                    Save current template
                </v-card-title>    
            </v-toolbar>

            <v-row >
                <v-col>
                    <v-data-table
                        v-model="selectedTemplate"
                        :headers="templateTableHeaders"
                        :items="templates"
                        :single-select="true"
                        :disable-pagination="true"
                        item-key="id"
                        show-select
                        class="elevation-1"
                        height="250px" width="30%"
                        @item-selected="templateChanged"
                        v-if="!isnew"
                        >
                    </v-data-table>
                    <v-text-field regular 
                        label="Template name" 
                        v-model="name"
                        v-if="isnew"
                        >
                    </v-text-field>
                </v-col>

                <v-col height="300px" width="70%">
                    <json-viewer :value="options.settings" boxed></json-viewer>
                </v-col>
            </v-row>

            <v-card-actions>
                <v-row align="center" justify="center">    
                <v-btn class="my-1" color="success" rounded dark large @click="agree"> 
                    Ok
                </v-btn>
                <v-btn class="my-1" color="warning" rounded dark large @click="cancel"> 
                    Cancel
                </v-btn>
                <v-btn class="my-1" color="error" rounded dark large @click="deleteTemplate"> 
                    Delete
                </v-btn>
                </v-row>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    // import series from "@/utils/series.js"
    import Vue from 'vue'
    import TemplateAPI from "@/api/TemplateAPI.js"
    import JsonViewer from 'vue-json-viewer'
    import 'vue-json-viewer/style.css'

    export default {
        name: 'TemplateDialog',
        components: {
            JsonViewer,
        },
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
                    settings: '',
                    success: false,
                    cancelled: false,
                },
            }
        },
        methods: {
            async open(isnew, settings) {
                this.dialog = true
                this.isnew = isnew
                this.options.settings = settings
                this.options.success = false
                if(!isnew) {
                    this.templates = await TemplateAPI.list_templates()
                    console.log(this.templates)
                }
                return new Promise((resolve, reject) => {
                    this.resolve = resolve
                    this.reject = reject
                });
            },
            async agree() {
                this.options.cancelled = false
                if (this.isnew) {
                    if(! this.name) {
                        Vue.notify({
                                group: 'datanotif',
                                type: 'error',
                                title: 'Save Template',
                                text: 'Name cannot be empty'
                            })
                        return
                    }
                    // save
                    // console.log(this.options.settings.setting)
                    await TemplateAPI.create_template(this.name, this.options.settings.setting)
                    this.options.success = true
                }
                this.resolve(this.options)
                this.dialog = false
            },
            cancel() {
                this.options.cancelled = true
                this.resolve(this.options)
                this.dialog = false
            },
            async deleteTemplate() {
                console.log(this.selectedTemplate)
                if (this.selectedTemplate.length > 0) {
                    await TemplateAPI.delete_template(this.selectedTemplate[0].id)
                    this.templates = await TemplateAPI.list_templates()
                }
            },
            async templateChanged(anItem) {
                // select
                if(anItem.value){
                    // now load
                    this.options.settings = await TemplateAPI.get_template(anItem.item.id)
                }
                else {
                    this.options.settings = ""
                }
            }
        },
    }
</script>