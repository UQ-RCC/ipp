<template>
    <v-dialog v-model="dialog" persistent scrollable max-height="60%" max-width="50%">
        <v-card>
            <v-toolbar dark color="#49075e">
                <v-btn icon dark @click="cancel">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-card-title class="headline" v-if="!isnew && !isglobal">
                    Load my settings
                </v-card-title>
                <v-card-title class="headline" v-if="!isnew && isglobal">
                    Load global settings
                </v-card-title>
                <v-card-title class="headline" v-if="isnew">
                    Save current settings
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
                        label="File name" 
                        v-model="name"
                        v-if="isnew"
                        >
                    </v-text-field>
                </v-col>

                <v-col height="300px" width="70%">
                    <json-viewer :value="options.settings " boxed></json-viewer>
                </v-col>
            </v-row>

            <v-card-actions>
                <v-row align="center" justify="center">    
                <v-btn class="my-1" color="success" rounded dark large @click="agree"> 
                    Confirm
                </v-btn>
                <v-btn class="my-1" color="warning" rounded dark large @click="cancel"> 
                    Cancel
                </v-btn>
                <v-btn class="my-1" color="error" rounded dark large @click="deleteSettingFile" v-if="(!isnew && !isglobal) ||(!isnew && is_admin)"> 
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
        name: 'SettingsDialog',
        components: {
            JsonViewer,
        },
        data() {
            return {
                dialog: false,
                name: '',
                isnew: false, 
                isglobal: false,
                illuminationType: null,
                resolve: null,
                reject: null,
                templates: [],
                selectedTemplate: [],
                templateTableHeaders: 
                [
                    { text: 'Name', value: 'name' }
                ],
                options:{
                    settings: null,
                    success: false,
                    cancelled: false,
                },
                dbrecord: {
                    username: null,
                    name: null,
                    illuminationtype: null,
                    objmagnification: null,
                    auxmagnification: null,
                    pinholesize: null,
                    model: '',
                    pinholeshape: '',
                    pinholeside: '',
                    shapefactor: null,
                    sysmagnification: null,
                    pinholespacing: null
                },
            }
        },
        computed: {
            username: function() {
                return this.$keycloak && this.$keycloak.idTokenParsed ? this.$keycloak.idTokenParsed.preferred_username  : ''
            },
            is_admin: function() {
                return this.$keycloak.hasRealmRole("admin")
            },
        },
        methods: {
            async open(isnew, settings, isglobal, illuminationType) {
                this.selectedTemplate = []
                this.dialog = true
                this.isnew = isnew
                this.isglobal = isglobal
                this.illuminationType = illuminationType
                this.options.settings = settings
                if (this.options.settings)
                    this.options.settings.model = this.options.settings.model instanceof Object ? this.options.settings.model.model : this.options.settings.model    
                this.options.success = false
                if(!isnew) {
                        console.log(isglobal)
                        this.templates = await TemplateAPI.list_settings(illuminationType, isglobal)
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
                                title: 'Save Settings',
                                text: 'Name cannot be empty'
                            })
                        return
                    }
                    // save
                    if(this.isglobal) {
                        this.dbrecord.username = "admin" 
                    } else {
                        this.dbrecord.username = this.username 
                    }

                    this.dbrecord.name = this.name
                    this.dbrecord.illuminationtype = this.illuminationType
                    this.dbrecord.objmagnification = this.options.settings.objmagnification === "" ? null : this.options.settings.objmagnification
                    this.dbrecord.auxmagnification = this.options.settings.auxmagnification
                    this.dbrecord.pinholesize = this.options.settings.pinholesize
                    this.dbrecord.model = this.options.settings.model instanceof Object ? this.options.settings.model.model : this.options.settings.model
                    this.dbrecord.pinholeshape = this.options.settings.pinholeshape
                    this.dbrecord.pinholeside = this.options.settings.pinholeside
                    this.dbrecord.shapefactor = this.options.settings.shapefactor
                    this.dbrecord.sysmagnification = this.options.settings.sysmagnification
                    this.dbrecord.pinholespacing = this.options.settings.pinholespacing ?? null  
                    
                    await TemplateAPI.save_settings_file(this.dbrecord)
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
            async deleteSettingFile() {
                console.log("delete temp")
                console.log(this.selectedTemplate)
                if (this.selectedTemplate.length > 0) {
                    await TemplateAPI.delete_setting_file(this.selectedTemplate[0].id)
                    this.templates = await TemplateAPI.list_settings(this.illuminationType, this.isglobal)
                    this.options.settings = ''
                }
            },
            async templateChanged(anItem) {
                // select
                if(anItem.value){
                   this.name = anItem.item.name
                   this.options.settings = anItem.item
                   const data = anItem.item
                   delete data.username
                   //delete data.name
                   delete data.illuminationtype
                  // delete data.id
                   this.options.settings = data

                }
                else {
                    this.options.settings = ""
                }
            }
        },
    }
</script>