<template>
    <v-dialog v-model="dialog" persistent max-height="20% !important" max-width="30%">
        <v-card>
            <v-toolbar dark color="#49075e">
                <v-btn icon dark @click="cancel">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-card-title class="headline" >
                    Confirm Save
                </v-card-title>   
            </v-toolbar>
            
            <v-row style="margin:15px">
                <p> Template {{ name }} already exists.  
                        Do you want to overwite it?</p>

            </v-row>

            <v-card-actions>
                <v-row align="center" justify="center">    
                <v-btn class="my-1" color="success" rounded dark small @click="agree"> 
                    Ok
                </v-btn>
                <v-btn class="my-1" color="warning" rounded dark small @click="cancel"> 
                    Cancel
                </v-btn>
                </v-row>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    
    import 'vue-json-viewer/style.css'
    export default {
        name: 'TemplateOverrideDialog',
        data () {
            return {
                dialog: false,
                name:'',
                resolve: null,
                reject: null,
                options:{
                    success: false,
                    cancelled: false,
                },
            }
        },
        methods: {
            async open(name) {
                this.dialog = true
                console.log(" override dialog"+name)
                this.name = name
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
           cancel(){
                console.log("Cancel operation")
                this.dialog = false
            } 
        }
    }
</script>