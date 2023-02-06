<template>
    <div>
     
    <SettingsDialog ref="settingsdialog" />
    <v-dialog v-model="dialog" scrollable persistent max-height="100%" max-width="50%">
        <v-card max-width="100%" max-height="100%">
            <v-toolbar dark color="#49075e">
                <v-btn icon dark @click="cancel">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-card-title class="headline">
                    Backprojected Point Scanning Calculator
                </v-card-title>
            </v-toolbar>
            
                <!-- <v-col cols="6" md="4">
                    <v-tabs  fixed-tabs>
                        <v-tab> <v-icon  color="grey darken-2"> mdi-web </v-icon></v-tab>
                        <v-tab> <v-icon  color="grey darken-2"> mdi-file-download </v-icon></v-tab>
                        <v-tab-item>

                        </v-tab-item>
                    </v-tabs>
                    <v-card-actions>
                        <v-row align="center" justify="center">    
                        <v-btn class="my-1" color="primary" rounded dark small @click="agree"> 
                            Load
                        </v-btn>
                        <v-btn class="my-1" color="success" rounded dark small @click="cancel"> 
                            Save
                        </v-btn>
                        </v-row>
                    </v-card-actions>


                </v-col> -->
               <!--  <v-divider vertical></v-divider> -->
               <form>
                        <v-row align="center" justify="center">    
                            <v-col cols="8" sm="6" md="8">
                                <v-row align="center" justify="center">
                                    <v-col cols="3" sm="4" md="6">
                                        <v-text-field regular 
                                            type="number"
                                            :rules="[rules.required, rules.numberRules]"  
                                            @change="valueChange" 
                                            label="Objective Magnification" 
                                            v-model="pointscanning.objmagnification"
                                            required
                                            autofocus>
                                        </v-text-field>

                                    </v-col>
                                    <v-col cols="3" sm="4" md="6">
                                        <v-text-field regular 
                                            type="number"
                                            :rules="[rules.required, rules.numberRules]"  
                                            @change="valueChange" 
                                            label="Auxillary Magnification" 
                                            v-model="pointscanning.auxmagnification"
                                            required
                                            autofocus>
                                        </v-text-field>

                                    </v-col>

                                </v-row>
                                <v-text-field regular 
                                    type="number" 
                                    :rules="[rules.required, rules.numberRules]"  
                                    @change="valueChange" 
                                    label="Reported Pinhole Size (µm)" 
                                    v-model="pointscanning.pinholesize"
                                    required
                                    autofocus>
                                </v-text-field>
                                <v-select 
                                        id="models"
                                        :items="psmodels"
                                        item-text = "model"
                                        v-model="pointscanning.model"
                                        label="Microscope Configuration"
                                        @change="getpsData"
                                        return-object
                                            >
                                </v-select>
                                <v-row align="center" justify="center">
                                    <v-col cols="3" sm="4" md="6">
                                        <v-select
                                            :items="psmodels"
                                            item-text = "pinholeshape"
                                            v-model="pointscanning.pinholeshape"
                                            label="Pinhole shape"
                                            @change="valueChange"
                                            return-object
                                            >
                                        </v-select>
                                    </v-col>
                                    <v-col cols="3" sm="4" md="6">
                                    <v-select
                                        :items="psmodels"
                                        item-text = "pinholeside"
                                        v-model="pointscanning.pinholeside"
                                        label="Reported Pinhole Side"
                                        @change="valueChange"
                                        return-object
                                        >
                                    </v-select>
                                    </v-col>
                                </v-row>
                                <v-text-field regular 
                                    type="number" 
                                    :rules="[ rules.numberRules]" 
                                    @change="valueChange" 
                                    label="Shape Factor" 
                                    v-model="pointscanning.shapefactor">
                                </v-text-field>                                  
                                <v-text-field regular 
                                    type="number" 
                                    :rules="[ rules.numberRules]" 
                                    @change="valueChange" 
                                    label="Internal System magnification" 
                                    v-model="pointscanning.sysmagnification">
                                </v-text-field>
                            </v-col>
                        </v-row>
                        <v-divider ></v-divider>
                        <v-row align="center" justify="center">    
                            <v-col cols="6" sm="6" md="8">        
                                <v-text-field regular 
                                    type="number" 
                                    label="B.P. Pinhole Radius (nm)" 
                                    v-model="options.pinholeRadius"
                                    readonly>
                                </v-text-field>
                            </v-col>
                            
                        </v-row>
                        
                        <v-card-actions>
                            <v-row align="center" justify="center">    
                                
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-btn 
                                            class="my-3" 
                                            color="success" 
                                            fab dark  
                                            v-bind="attrs" 
                                            v-on="on"
                                            @click="agree">
                                            <v-icon>mdi-send</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Send Results to Panel</span>
                                </v-tooltip>
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-btn 
                                            class="my-3" 
                                            color="error" 
                                            fab dark  
                                            v-bind="attrs" 
                                            v-on="on"
                                            @click="cancel">
                                            <v-icon>mdi-cancel</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Cancel</span>
                                </v-tooltip>
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-btn 
                                            class="my-3" 
                                            color="primary" 
                                            fab dark  
                                            v-bind="attrs" 
                                            v-on="on"
                                            @click="loadSettings(true)">
                                            <v-icon>mdi-web</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Load Global Settings</span>
                                </v-tooltip>
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-btn 
                                            class="my-3" 
                                            color="secondary" 
                                            fab dark  
                                            v-bind="attrs" 
                                            v-on="on"
                                            @click="loadSettings(false)"
                                            >
                                            <v-icon>mdi-file-import</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Load My Settings</span>
                                </v-tooltip>
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-btn 
                                            class="my-3" 
                                            color="blue-grey" 
                                            fab dark  
                                            v-bind="attrs" 
                                            v-on="on"
                                            @click.stop="saveSettings()" 
                                            >
                                            <v-icon>mdi-content-save</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Save Settings</span>
                                </v-tooltip>
                            </v-row>
                        </v-card-actions>
                    
                </form>
            



           

            

        </v-card>
    </v-dialog>
       
</div>
</template>


<script>
    import Vue from 'vue'
    import series from "@/utils/series.js";
    import VueCookies from 'vue-cookies'
    import pcSettings from '@/utils/pcSettings'
    import SettingsDialog from '@/components/SettingsDialog'
  
      
    Vue.use(VueCookies)
    

    export default {
        name: 'PsCalculatorDialog',
        components: {
            SettingsDialog,
        },
        data: () => ({
            tab: 0,
            dialog: false,
            resolve: null,
            reject: null,
            show: false,
            settings: pcSettings,
            options:{
                pinholeRadius: 0,
                //pinholeSpacingnm: 0,
                cancelled: false,
            },
            
            pointscanning: {
                model : "Zeiss LSM AxioObserver (Invert) Sideport",
                pinholeshape : "Square",
                pinholeside : "side",
                shapefactor : 564.19,
                sysmagnification : 1.74,
                objmagnification: null,
                auxmagnification: null,
                pinholesize: null,
               // pinholeRadius: null,
                
            },

            rules: {
                required : value => !! value || "The input is required",
                numberRules: value => value && parseInt(value) && String(value).match(/^\d+(\.\d+)?$/).length > 0 || 'Must be a positive number',


            }
           
           
        }),
        computed: {
            username: function() {
                return this.$keycloak && this.$keycloak.idTokenParsed ? this.$keycloak.idTokenParsed.preferred_username  : ''
            },
            psmodels() {
                const obj= this.settings.pointScanning
                const resultArray = Object.keys(obj).map(function(key) {
                    return obj[key]
                })
                return resultArray
            },
           
           
        },
        methods: {


            getpsData() {
                //this.pointscanning.pinholeshape = this.settings.pointScanning.find(l => l.model === this.pointscanning.model.model).pinholeshape
        
                this.pointscanning.pinholeshape = this.pointscanning.model.pinholeshape
                this.pointscanning.pinholeside = this.pointscanning.model.pinholeside 
                this.pointscanning.shapefactor = this.pointscanning.model.shapefactor
                this.pointscanning.sysmagnification = this.pointscanning.model.sysmagnification
                this.valueChange()

            },
           
            open() {
                this.dialog = true;
                return new Promise((resolve, reject) => {
                    this.resolve = resolve
                    this.reject = reject
                });
            },
            agree() {
                if (this.pointscanning.objmagnification && this.pointscanning.auxmagnification && this.pointscanning.pinholesize) {
                    this.options.cancelled = false
                    this.resolve(this.options)
                    this.dialog = false
                }
            },
            cancel() {
                this.options.cancelled = true
                this.resolve(this.options)
                this.dialog = false
            },
            valueChange(){
                
                    let shapefactor = this.pointscanning.shapefactor
                    
                    this.options.pinholeRadius = shapefactor *  this.pointscanning.pinholesize /
                                                        (this.pointscanning.objmagnification * this.pointscanning.sysmagnification * this.pointscanning.auxmagnification)
                    this.options.pinholeRadius = series.roundToTwo(this.options.pinholeRadius)
                    this.pointscanning.pinholeRadius = this.options.pinholeRadius

            },
             /**
             * save settings to databsae: save the working one
             */
            async saveSettings(){
                if (this.pointscanning.objmagnification && this.pointscanning.auxmagnification && this.pointscanning.pinholesize) {
                
                    let illuminationType = 'confocal'
                    let options = await this.$refs.settingsdialog.open(true, this.pointscanning, false, illuminationType )
                    if (!options.cancelled) {
                        if(options.success)
                            Vue.notify({
                                group: 'datanotif',
                                type: 'info',
                                title: 'Save Settings',
                                text: 'Successfully save settings'
                            })
                        else 
                            Vue.notify({
                                group: 'datanotif',
                                type: 'error',
                                title: 'Save Settings',
                                text: 'Problem saving settings. Please try again!'
                            })
                    }   
                }
            },

            async loadSettings(isGlobal){
                let illuminationType = 'confocal'
                let options = await this.$refs.settingsdialog.open(false, '', isGlobal, illuminationType)
                if (!options.cancelled) {
                    Vue.$log.info("Setting file loaded")
                    Vue.$log.info(options.settings)
                    this.pointscanning = Object.assign({}, options.settings)
                    this.valueChange()
                }
            },
            
            

        },
        mounted: function(){   
           
            this.valueChange()
            
            
            
        }
    }

</script>