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
                        Backprojected Spinning Disc Calculator
                    </v-card-title>
                </v-toolbar>
                
                    
                    <v-row align="center" justify="center">    
                        <v-col cols="6" sm="6" md="8">
                            <v-row align="center" justify="center">
                                <v-col cols="3" sm="4" md="6" >
                                    <v-text-field regular 
                                        type="number"
                                        :rules="[rules.required]"
                                        @change="valueChange" 
                                        label="Objective Magnification" 
                                        v-model="spinningDisc.objmagnification"
                                        required 
                                        autofocus
                                        ref="om">
                                    </v-text-field>

                                </v-col>
                                
                                <v-col cols="3" sm="4" md="6" v-if="!isSoRa">
                                    <v-text-field regular 
                                        type="number"
                                        :rules="[rules.required]"
                                        @change="valueChange" 
                                        label="Auxillary Magnification" 
                                        v-model="spinningDisc.auxmagnification"
                                        required
                                        ref="am">
                                    </v-text-field>

                                </v-col>
                                
                                <v-col cols="3" sm="4" md="6" v-if="isSoRa">
                                    <v-select
                                        :items="auxmag"
                                        item-text= "label"
                                        item-value="value"
                                        label="Auxillary Magnification" 
                                        v-model="spinningDisc.auxmagnification"
                                        required 
                                        @change="getObjMag"
                                        
                                        >
                                    </v-select>
                                </v-col>

                            </v-row>
                            
                            <v-select 
                                    :items="models"
                                    item-text="label"
                                    item-value="value"
                                    v-model="modelId"
                                    label="Microscope Configuration"
                                    @change="getspdData"
                                   
                                    >
                                    
                            </v-select>
                            <v-row align="center" justify="center">
                                <v-col cols="3" sm="4" md="6">
                                    <v-select
                                        :items="settings"
                                        item-text = "pinholeshape"
                                        v-model="spinningDisc.pinholeshape"
                                        label="Pinhole Shape"
                                        @change="valueChange"
                                        return-object
                                        >
                                    </v-select>
                                </v-col>
                                    <v-col cols="3" sm="4" md="6">
                                    <v-text-field regular 
                                        type="number" 
                                        :rules="[rules.numberRules]"
                                        @change="valueChange" 
                                        label="Shape Factor" 
                                        v-model="spinningDisc.shapefactor">
                                    </v-text-field>
                                    </v-col>
                            </v-row>
                            
                            <v-text-field regular 
                                type="number" 
                                :rules="[rules.numberRules]"
                                @change="valueChange" 
                                label="Internal System magnification" 
                                v-model="spinningDisc.sysmagnification">
                            </v-text-field> 
                                
                            <v-text-field regular 
                                type="number" 
                                :rules="[rules.numberRules]"
                                @change="valueChange" 
                                label="Pinhole Size (µm)" 
                                v-model="spinningDisc.pinholesize"
                            >
                            </v-text-field>
                            <v-text-field regular 
                            type="number" 
                            :rules="[rules.numberRules]"
                            @change="valueChange" 
                            label="Pinhole Spacing (µm)" 
                            v-model="spinningDisc.pinholespacing"
                            >
                        </v-text-field>
                        
                    
                        </v-col>
                    </v-row>
                        
                    <v-divider ></v-divider>
                    <v-row align="center" justify="center"> 
                        <v-col cols="6" sm="6" md="8">
                            <v-row align="center" justify="center">
                                <v-col cols="3" sm="4" md="6">        
                                    <v-text-field regular 
                                        type="number" 
                                        label="B.P. Pinhole Radius (nm)" 
                                        v-model="options.pinholeRadius"
                                        readonly>
                                    </v-text-field>
                                </v-col>
                                <v-col cols="3" sm="4" md="6" >        
                                    <v-text-field regular 
                                        type="number" 
                                        label="B.P. Pinhole Spacing (nm)" 
                                        v-model="options.pinholeSpacingnm"
                                        readonly>
                                    </v-text-field>
                                </v-col>
                            </v-row>
                        </v-col>   
                    </v-row>
                        
                        
                        <v-row align="center" justify="center">  
                            <v-col cols="6" sm="4" md="5">
                                <v-card-actions>

                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-btn 
                                                class="my-3" 
                                                color="success" 
                                                fab dark  
                                                v-bind="attrs" 
                                                v-on="on"
                                                @click.stop="agree" :disabled="!btnshow">
                                                <v-icon>mdi-send</v-icon>
                                            </v-btn>
                                        </template>
                                        <span>Send Results to Panel</span>
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
                                                color="primary" 
                                                fab dark  
                                                v-bind="attrs" 
                                                v-on="on"
                                                @click.stop="saveSettings(true)" 
                                                 v-if="is_admin">
                                                <v-icon>mdi-content-save-settings</v-icon>
                                            </v-btn>
                                        </template>
                                        <span>Save Global Settings</span>
                                    </v-tooltip>
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-btn 
                                                class="my-3" 
                                                color="warning" 
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
                                                color="warning" 
                                                fab dark  
                                                v-bind="attrs" 
                                                v-on="on"
                                                @click.stop="saveSettings(false)" 
                                                >
                                                <v-icon>mdi-content-save</v-icon>
                                            </v-btn>
                                        </template>
                                        <span>Save My Settings</span>
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
                                </v-card-actions>
                                </v-col>  
                            </v-row>

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
        name: 'SdcCalculator',
        components: {
            SettingsDialog,
        },
        data: () => ({
            tab: 0,
            dialog: false,
            resolve: null,
            reject: null,
            show: false,
            btnshow : false,
            settings: pcSettings.spinningDisk,
            illuminationType : null,
            isSoRa: false,
            auxmag: [ 2.8, 4 ],
            modelId:0,
            options:{
                pinholeRadius: 0,
                pinholeSpacingnm: 0,
                cancelled: false,
            },
            spinningDisc: {
                model: "Yokogawa X1 50",
                objmagnification:  null,
                auxmagnification: 1,
                sysmagnification: 1,
                pinholesize: 50,
                pinholespacing: 253,
                shapefactor: 500,
                pinholeshape: "Circular"
            },
            rules: {
                required : value => !! value || "The input is required",
                numberRules: value => value && parseInt(value) && String(value).match(/^\d+(\.\d+)?$/).length > 0 || 'Must be a positive number',
            },
            models: [
                {label:"Yokogawa X1 50", value:0},
                {label:"Yokogawa W1 50", value:1},
                {label:"Yokogawa W1 25", value:2},
                {label:"Andor Dragonfly 40", value:3},
                {label:"Andor Dragonfly 25", value:4},
                {label:"Visitech Infinity", value:5},
                {label:"Crest X-Light v3", value:6},
                {label:"Crest X-Light v3", value:7},
                {label:"iSIM", value:8}

            ]

            
           
        }),
        computed: {
            username: function() {
                return this.$keycloak && this.$keycloak.idTokenParsed ? this.$keycloak.idTokenParsed.email  : ''
            },
            is_admin: function() {
                return this.$keycloak.hasRealmRole("admin")
            },
           
            spdmodels() {
                const obj= this.settings.spinningDisk
                const resultArray = Object.keys(obj).map(function(key) {
                    return obj[key]
                })
                return resultArray
            }
           
        },
        methods: {

            getspdData() {
                
                
                for (let i=0; i< this.settings.length; i++) {
                    if (this.modelId === this.settings[i].id ) {
                        this.spinningDisc.model = this.settings[i].model
                        this.spinningDisc.sysmagnification = this.settings[i].sysmagnification
                        this.spinningDisc.pinholesize = this.settings[i].pinholesize
                        this.spinningDisc.pinholespacing = this.settings[i].pinholespacing
                        this.spinningDisc.shapefactor = this.settings[i].shapefactor
                        this.spinningDisc.pinholeshape = this.settings[i].pinholeshape
                    }
                } 
                if (this.illuminationType === 'SoRa'){
                    if (this.modelId === 1 || this.modelId === 2  ){
                        this.isSoRa = true
                    } else {
                        this.isSoRa = false
                        this.spinningDisc.auxmagnification = null
                    }
                } else {
                    this.isSoRa = false
                    this.spinningDisc.auxmagnification = 1
                }
                
                this.valueChange()

            },
            getObjMag () {
                if(this.spinningDisc.auxmagnification === 2.8) {
                    this.spinningDisc.objmagnification = 60
                }
                if(this.spinningDisc.auxmagnification === 4){
                    this.spinningDisc.objmagnification = 100
                }
                this.valueChange()
            },
            open(illuminationType) {
                this.dialog = true;
                this.illuminationType = illuminationType;
                return new Promise((resolve, reject) => {
                    this.resolve = resolve
                    this.reject = reject
                });
            },
            agree() {
                
                    this.options.cancelled = false
                    this.resolve(this.options)
                    this.dialog = false
            },
            cancel() {
                this.options.cancelled = true
                this.resolve(this.options)
                this.dialog = false
            },
            valueChange(){
                    if(!this.spinningDisc.objmagnification || !this.spinningDisc.sysmagnification || !this.spinningDisc.pinholesize || !this.spinningDisc.pinholespacing || !this.spinningDisc.auxmagnification ){
                        this.options.pinholeSpacingnm = null
                        this.options.pinholeRadius = null
                        this.btnshow =false
                    }else {
                        // follow: https://svi.nl/PinholeRadius
                        this.options.pinholeRadius =  this.spinningDisc.pinholesize / (this.spinningDisc.objmagnification * this.spinningDisc.sysmagnification * this.spinningDisc.auxmagnification) / 2 * 1000                           
                        this.options.pinholeRadius = series.roundToTwo(this.options.pinholeRadius)
                        this.options.pinholeSpacingnm = (this.spinningDisc.pinholespacing / (this.spinningDisc.objmagnification * this.spinningDisc.sysmagnification * this.spinningDisc.auxmagnification) * 1000)
                        this.options.pinholeSpacingnm = series.roundToTwo(this.options.pinholeSpacingnm)
                        this.btnshow =true
                    }
            },
         /**
             * save settings to databsae: save the working one
             */
            async saveSettings(isGlobal){
                
                let options = await this.$refs.settingsdialog.open(true, this.spinningDisc, isGlobal, this.illuminationType )
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
        },

            async loadSettings(isGlobal){
                let options = await this.$refs.settingsdialog.open(false, '', isGlobal, this.illuminationType)
                if (!options.cancelled) {
                    Vue.$log.info("Setting file loaded")
                    Vue.$log.info(options.settings)
                    this.spinningDisc = Object.assign({}, options.settings)
                    for (let i=0; i< this.settings.length; i++) {
                        if (this.spinningDisc.model === this.settings[i].model) {
                            this.modelId = this.settings[i].id
                        }
                    }
                    this.valueChange()
                }
            },
        },

        mounted: function(){   
            
            this.valueChange()
            this.isSoRa = false
        },
    }

</script>
<style lang="scss" scoped>
    .theme--dark.v-btn.v-btn--disabled.v-btn--has-bg {
        background-color: #d4d0d0!important;
    }
</style>