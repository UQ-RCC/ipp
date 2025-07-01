<template>
    <div>
        <v-row align="center" justify="center">
            <v-col cols="12" sm="8" md="10" lg="12">
                <v-card max-height="100%" max-width="99%">
                <br />

                    <div>
                        <v-card-title align="start" justify="center">Web Resources</v-card-title>
                        <v-card-text>
            
                            <v-row align="center" justify="center" class="mx-3">
                                <v-col cols="12" sm="4" md="6" lg="8">

                                    <!-- <v-table fixed-header height="300px" >
                    
                                        <tbody>
                                            <tr v-if="is_admin">
                                                <td></td>
                                                
                                                <td >
                                                    <v-tooltip bottom>

                                                            <template v-slot:activator="{ on, attrs }">
                                                                <v-btn  class="my-1"   @click="add()" v-bind="attrs" v-on="on">
                                                                    <v-icon >
                                                                        mdi-plus
                                                                    </v-icon> Add New
                                                                </v-btn>
                                                            </template> 
                                                            <span>Add a new resource</span>
                                                    </v-tooltip>
                                                </td>

                                            </tr>
                                            <tr v-if="!links || links.length === 0">
                                                <td> No Resources </td>

                                            </tr>
                                            <tr v-else v-for="link in links"
                                                v-bind:key="link.id">
                                                <td class="text-left" style="padding-right: 100px;">
                                                    <v-list-item
                                                        :href="link.link"
                                                        target="_blank">
                                                        <v-list-item-icon>
                                                            <v-icon>mdi-file-document</v-icon>
                                                        </v-list-item-icon>
                                                        <v-list-item-title class="ml-n5" style="padding-right: 30px;" title="Click to open">{{link.title}}</v-list-item-title>
                                                    </v-list-item>
                                                    </td>
                                                    <td v-if="is_admin"> 
                                                        <v-tooltip bottom>

                                                            <template v-slot:activator="{ on, attrs }">
                                                                <v-btn fab small class="ma-2"  color="primary" @click.stop="edit(link.id)" v-bind="attrs" v-on="on" variant="text">
                                                                    <v-icon >
                                                                        mdi-pencil
                                                                    </v-icon>
                                                                    
                                                                </v-btn>
                                                            </template> 
                                                            <span>Edit</span>
                                                        </v-tooltip>
                                                        <v-tooltip bottom>

                                                            <template v-slot:activator="{ on, attrs }">
                                                                <v-btn fab  small class="ma-2" color="error" @click.stop="remove(link.id)" v-bind="attrs" v-on="on">
                                                                    <v-icon >
                                                                        mdi-delete
                                                                    </v-icon>
                                                                </v-btn>
                                                            </template> 
                                                            <span>Delete</span>
                                                        </v-tooltip>
                                                        
                                                    </td>

                                            </tr>

                                        </tbody>

                                    </v-table> -->
                                    <v-list two-line>
                                        <v-list-item  v-if="!links || links.length === 0">
                                            <h5>No Resources</h5>
                                        </v-list-item>
                                        <v-list-item v-else
                                            v-for="link in links"
                                            :key="link.id"
                                            class="d-flex align-center justify-space-between"
                                        >
                                            <v-list-item-content>
                                                <v-list-item-title :title="'Click to open'" class="font-weight-medium">
                                                    <a :href="link.link" target="_blank" class="text-decoration-none text--primary">
                                                    <v-icon left class="mr-2">mdi-file-document</v-icon> {{ link.title }}
                                                    </a>
                                                </v-list-item-title>
                                            </v-list-item-content>

                                            <v-list-item-action v-if="is_admin" class="d-flex align-center">
                                                 <div class="d-flex flex-row align-center" style="gap: 8px;">

                                                     <v-tooltip top>
                                                         <template #activator="{ on, attrs }">
                                                         <v-btn icon color="primary" v-bind="attrs" v-on="on" @click.stop="edit(link.id)" >
                                                             <v-icon>mdi-pencil</v-icon>
                                                         </v-btn>
                                                         </template>
                                                         <span>Edit</span>
                                                     </v-tooltip>
     
                                                     <v-tooltip top>
                                                         <template #activator="{ on, attrs }">
                                                         <v-btn icon color="error" v-bind="attrs" v-on="on" @click.stop="remove(link.id)">
                                                             <v-icon>mdi-delete</v-icon>
                                                         </v-btn>
                                                         </template>
                                                         <span>Delete</span>
                                                     </v-tooltip>
                                                 </div>
                                            </v-list-item-action>
                                        </v-list-item>
                                    </v-list>

                                    <!-- Add New Button -->
                                    <v-btn v-if="is_admin" color="primary" class="mt-4" @click="add()" outlined>
                                    <v-icon left>mdi-plus</v-icon>
                                    Add New
                                    </v-btn>

                                </v-col>
                            </v-row>

                        </v-card-text>
                    </div>
                </v-card>
            </v-col>
        </v-row>

        <v-dialog v-model="dialog" max-width="500">
            <v-card max-height="100%" max-width="99%">
                <v-card-title>
                    {{ isEditing ? 'Edit' : 'Add' }} a resource
                </v-card-title>
                
                <v-card-text>

                    <v-row align="center" justify="center" class="mx-3">
                        <!--  <v-col cols="12"  sm="12" md="4" lg="4" xl="4"> -->
    
                        <v-text-field label="Title"  v-model="record.title" regular></v-text-field>
                        <!-- </v-col> -->
    
                    </v-row>
    
                    <v-row align="center" justify="center" class="mx-3">
    
    
                        <v-text-field label="Link" v-model="record.link" regular ></v-text-field>
    
                    </v-row>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions class="bg-surface-light">
                    <v-btn class="my-1" color="warning" rounded dark large @click="dialog = false">Cancel</v-btn>

                    <v-spacer></v-spacer>

                    <v-btn class="my-1" color="success" rounded dark large @click="save">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog> 
        <v-dialog v-model="deletedialog" max-width="500">
            <v-card max-height="100%" max-width="99%">
                <v-card-title>
                    Confirm Delete
                </v-card-title>
                
                <v-card-text>

                    <v-alert
                        border="bottom"
                        type="error"
                        outlined
                    >
                        This will delete the record. Please consider carefully!
                </v-alert>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions class="bg-surface-light">
                    <v-btn class="my-1" color="warning" rounded dark large @click="deletedialog = false">Cancel</v-btn>
                    <v-spacer></v-spacer>

                    <v-btn class="my-1" color="success" rounded dark large @click="agree()">Confirm</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog> 



    </div>
</template>

<script>

import Vue from 'vue'
import PreferenceAPI from "@/api/PreferenceAPI"
//import axios from 'axios'


 export default {
    name: 'Resources',
    data() {
        return {
            links: [],
            isEditing: false,
            dialog: false,
            deletedialog: false,
            deleteId:null,
            record:[]



        }
    },
    computed:{
        is_admin: function() {
                let admin = Vue.prototype.$Config.keycloak.admin
                console.log(admin)
                return this.$keycloak.hasRealmRole(admin)
        }
    },
    mounted: async function() {
        this.links = await PreferenceAPI.get_resources()
        console.log(this.links)
    },
    methods: {
        async save(){
            
            const payload = {
                title: this.record.title,
                link: this.record.link
            }
            if(!this.isEditing) {
                console.log("adding new record")
                let response= await PreferenceAPI.create_resource(payload)
                console.log(response)
            }else {
                console.log("update a record")
                console.log(payload)
                console.log(this.record.id)
                await PreferenceAPI.update_resource(this.record.id,payload)
            }
            this.links = await PreferenceAPI.get_resources()
            this.dialog = false
            
        },
        async edit(id){
            console.log(id)
            this.record = this.links.find(link => link.id === id)
            this.dialog = true
            this.isEditing = true
        },
        async add() {
            this.record =[]
            this.dialog = true
            this.isEditing = false
            console.log(this.record)
            
            //this.dialog = false
        }, 
        async remove(id){
            console.log(id)
            this.deleteId = id
            this.deletedialog = true
            this.isEditing = false
            
        },
        async agree(){
            console.log( this.deleteId)
            let index = this.links.findIndex(link => link.id === this.deleteId)
            this.links.splice(index, 1)
            await PreferenceAPI.delete_resource(this.deleteId)  
            this.deletedialog = false
        }
    }

 }

</script>
<style></style>
