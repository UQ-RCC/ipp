<template>
    <v-dialog v-model="dialog" scrollable persistent max-height="100%" max-width="50%">
        <v-card max-width="100%" max-height="100%">
            <v-toolbar dark color="#49075e">
                <v-btn icon dark @click="cancel">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-card-title class="headline">
                    Backprojected Pinhole Calculator
                </v-card-title>
            </v-toolbar>
            <v-row>
                <v-col cols="6" md="4">
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

                </v-col>
                <v-divider vertical></v-divider>
                <v-col cols="12" sm="6" md="8">

                    <v-tabs @change="tabChanged" fixed-tabs >
                        <v-tab>Spinning disk</v-tab>
                        <!-- <v-tab>Airy units</v-tab> -->
                        <v-tab>Point scanning</v-tab>
        
                        <v-tab-item>
                            <v-row align="center" justify="center">    
                                <v-col cols="6" sm="6" md="8">
                                    <v-row align="center" justify="center">
                                        <v-col cols="3" sm="4" md="6">
                                            <v-text-field regular 
                                                type="number"
                                                :rules="required"
                                                @change="valueChange" 
                                                label="Objective Magnification" 
                                                v-model="spinningDisc.objmagnification"
                                                required >
                                            </v-text-field>

                                        </v-col>
                                        <v-col cols="3" sm="4" md="6">
                                            <v-text-field regular 
                                                type="number"
                                                :rules="required"
                                                @change="valueChange" 
                                                label="Auxillary Magnification" 
                                                v-model="spinningDisc.auxmagnification"
                                                required>
                                            </v-text-field>

                                        </v-col>

                                    </v-row>
                                    
                                    <v-select 
                                            id="spmodels"
                                            :items="spdmodels"
                                            item-text = "model"
                                            v-model="spinningDisc.model"
                                            label="Microscope Configuration"
                                            @change="getspdData"
                                            return-object
                                             >
                                          
                                    </v-select>
                                    <v-row align="center" justify="center">
                                        <v-col cols="3" sm="4" md="6">
                                            <v-select
                                                :items="spdmodels"
                                                item-text = "pinholeShape"
                                                v-model="spinningDisc.pinholeShape"
                                                label="Pinhole shape"
                                                @change="valueChange"
                                                return-object
                                                >
                                            </v-select>
                                        </v-col>
                                         <v-col cols="3" sm="4" md="6">
                                            <!-- <v-select
                                                :items="spdmodels"
                                                item-text = "reportedSide"
                                                v-model="spinningdisk.square_side"
                                                label="Reported Pinhole Side"
                                                @change="valueChange"
                                                return-object
                                                >
                                            </v-select> -->
                                            <v-text-field regular 
                                                type="number" 
                                                :rules="numberRules"
                                                @change="valueChange" 
                                                label="Shape Factor" 
                                                v-model="spinningDisc.shapeFactor">
                                            </v-text-field>
                                         </v-col>
                                    </v-row>
                                    
                                    <v-text-field regular 
                                        type="number" 
                                        :rules="numberRules"
                                        @change="valueChange" 
                                        label="Internal System magnification" 
                                        v-model="spinningDisc.systemMagnification">
                                    </v-text-field> 
                                        
                                    <v-text-field regular 
                                        type="number" 
                                        :rules="numberRules"
                                        @change="valueChange" 
                                        label="Pinhole Size (µm)" 
                                        v-model="spinningDisc.pinholesize"
                                    >
                                    </v-text-field>
                                    <v-text-field regular 
                                    type="number" 
                                    :rules="numberRules"
                                    @change="valueChange" 
                                    label="Pinhole Spacing (µm)" 
                                    v-model="spinningDisc.pinholeSpacing"
                                    >
                                </v-text-field>
                                
                            
                                </v-col>
                            </v-row>
                        </v-tab-item>
                       <!--  <v-tab-item>
                            <v-row align="center" justify="center">    
                                <v-col cols="20" sm="4" md="5">
                                    <v-text-field regular 
                                        type="number"
                                        :rules="numberRules"
                                        @change="valueChange" 
                                        label="Airy units" 
                                        v-model="airy.n">
                                    </v-text-field>
                                    <v-text-field regular 
                                        type="number" 
                                        :rules="numberRules"
                                        @change="valueChange" 
                                        label="Wavelength (nm)" 
                                        v-model="airy.wavelength">
                                    </v-text-field>
                                    <v-text-field regular 
                                        type="number" 
                                        :rules="numberRules"
                                        @change="valueChange" 
                                        label="Numerical aperture" 
                                        v-model="airy.na">
                                    </v-text-field>
                                    <v-row align="center" justify="center">
                                        <v-col cols="15" sm="5" md="6">
                                            <v-select
                                                :items="shapes"
                                                v-model="airy.shape"
                                                label="Pinhole shape"
                                                @change="valueChange"
                                                outlined
                                                return-object
                                                >
                                            </v-select>
                                        </v-col>
                                         <v-col cols="15" sm="5" md="6">
                                            <v-select
                                                :items="square_sides"
                                                v-model="airy.square_side"
                                                label="Report side"
                                                @change="valueChange"
                                                outlined
                                                return-object
                                                v-if="airy.shape === 'Square'"
                                                >
                                            </v-select>
                                         </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                        </v-tab-item> -->
                        <v-tab-item>
                            <v-row align="center" justify="center">    
                                <v-col cols="6" sm="6" md="8">
                                    <v-row align="center" justify="center">
                                        <v-col cols="3" sm="4" md="6">
                                            <v-text-field regular 
                                                type="number"
                                                :rules="required"
                                                @change="valueChange" 
                                                label="Objective Magnification" 
                                                v-model="pointscanning.mo"
                                                required>
                                            </v-text-field>

                                        </v-col>
                                        <v-col cols="3" sm="4" md="6">
                                            <v-text-field regular 
                                                type="number"
                                                :rules="required"
                                                @change="valueChange" 
                                                label="Auxillary Magnification" 
                                                v-model="pointscanning.ma"
                                                required
                                                class="custom-label-color">
                                            </v-text-field>

                                        </v-col>

                                    </v-row>
                                    <v-text-field regular 
                                        type="number" 
                                        :rules="required"
                                        @change="valueChange" 
                                        label="Reported Pinhole Size (µm)" 
                                        v-model="pointscanning.rphys"
                                        required>
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
                                                item-text = "pinholeShape"
                                                v-model="pointscanning.pinholeShape"
                                                label="Pinhole shape"
                                                @change="valueChange"
                                                return-object
                                                >
                                            </v-select>
                                        </v-col>
                                        <v-col cols="3" sm="4" md="6">
                                        <v-select
                                            :items="psmodels"
                                            item-text = "reportedSide"
                                            v-model="pointscanning.reportedSide"
                                            label="Reported Pinhole Side"
                                            @change="valueChange"
                                            return-object
                                            >
                                        </v-select>
                                        </v-col>
                                    </v-row>
                                    <v-text-field regular 
                                        type="number" 
                                        :rules="numberRules"
                                        @change="valueChange" 
                                        label="Shape Factor" 
                                        v-model="pointscanning.shapeFactor">
                                    </v-text-field>                                  
                                    <v-text-field regular 
                                        type="number" 
                                        :rules="numberRules"
                                        @change="valueChange" 
                                        label="Internal System magnification" 
                                        v-model="pointscanning.systemMagnification">
                                    </v-text-field>
                                </v-col>
                            </v-row>
                        </v-tab-item>                
                    </v-tabs>
                    <v-divider ></v-divider>
                    <v-row align="center" justify="center">    
                        <v-col cols="3" sm="4" md="6">        
                            <v-text-field regular 
                                type="number" 
                                label="B.P. Pinhole Radius (nm)" 
                                v-model="options.pinholeRadius"
                                readonly>
                            </v-text-field>
                        </v-col>
                        <v-col cols="3" sm="4" md="6" v-if="show">        
                            <v-text-field regular 
                                type="number" 
                                label="B.P. Pinhole Spacing (nm)" 
                                v-model="options.pinholeSpacingnm"
                                readonly>
                            </v-text-field>
                        </v-col>
                    </v-row>
                    
                    
                    <v-card-actions>
                        <v-row align="center" justify="center">    
                        <v-btn class="my-1" color="success" rounded dark normal @click="agree"> 
                            OK
                        </v-btn>
                        <v-btn class="my-1" color="warning" rounded dark normal @click="cancel"> 
                            Cancel
                        </v-btn>
                        </v-row>
                    </v-card-actions>
                </v-col>
            </v-row>



           

            

        </v-card>
    </v-dialog>
</template>
<style scoped>
.custom-label-color .v-label {
  color: red;
  opacity: 1;
}
</style>

<script>
    import Vue from 'vue'
    import series from "@/utils/series.js";
    import VueCookies from 'vue-cookies'
    import pcSettings from '@/utils/pcSettings'
  
      
    Vue.use(VueCookies)
    

    export default {
        name: 'PinholeCalculatorDialog',
        data: () => ({
            tab: 0,
            dialog: false,
            resolve: null,
            reject: null,
            show: false,
            settings: pcSettings,
            options:{
                pinholeRadius: 0,
                pinholeSpacingnm: 0,
                cancelled: false,
            },
            spinningDisc: {
                model: "Yokogawa X1 50",
                mo:  null,
                ma: null,
                systemMagnification: 1,
                pinholesize: 50,
                pinholeSpacing: 500,
                shapeFactor: 500,
                pinholeShape: "Circular"
            },
            /* airy: {
                n: 1, 
                wavelength: 580, 
                na: 1.4, 
                shape: 'Circular',
                square_side: 'Side'
            }, */ 
            pointscanning: {
                model : "Zeiss LSM AxioObserver (Invert) Sideport",
                pinholeShape : "Square",
                reportedSide : "side",
                shapeFactor : 564.19,
                systemMagnification : 1.74,
                mo: null,
                ma: null,
                rphys: null,
                
            },
            numberRules: [
                value => value && parseInt(value) && String(value).match(/^\d+(\.\d+)?$/).length > 0 || 'Must be a positive number'
            ],
           required : [ 
            value => !! value || "The input is required",
            value => value && parseInt(value) && String(value).match(/^\d+(\.\d+)?$/).length > 0 || 'Must be a positive number',
            ], 
           
           
        }),
        computed: {
            username: function() {
                return this.$keycloak && this.$keycloak.idTokenParsed ? this.$keycloak.idTokenParsed.email  : ''
            },
            psmodels() {
                const obj= this.settings.pointScanning
                console.log(obj)
                const resultArray = Object.keys(obj).map(function(key) {
                    return obj[key]
                })
                console.log(resultArray)
                return resultArray
            },
            spdmodels() {
                const obj= this.settings.spinningDisk
                console.log(obj)
                const resultArray = Object.keys(obj).map(function(key) {
                    return obj[key]
                })
                console.log(resultArray)
                return resultArray
            }
           
        },
        methods: {
            getpsData() {
                //this.pointscanning.pinholeShape = this.settings.pointScanning.find(l => l.model === this.pointscanning.model.model).pinholeShape
                this.pointscanning.pinholeShape = this.pointscanning.model.pinholeShape
                this.pointscanning.reportedSide = this.pointscanning.model.reportedSide 
                this.pointscanning.shapeFactor = this.pointscanning.model.shapeFactor
                this.pointscanning.systemMagnification = this.pointscanning.model.systemMagnification
                this.valueChange()

            },
            getspdData() {
                this.spinningDisc.pinholeShape = this.spinningDisc.model.pinholeShape
                //this.spinningdisk.square_side = this.spinningdisk.model.reportedSide 
                this.spinningDisc.shapeFactor = this.spinningDisc.model.shapeFactor
                this.spinningDisc.systemMagnification = this.spinningDisc.model.systemMagnification 
                this.spinningDisc.pinholesize = this.spinningDisc.model.pinholesize
                this.spinningDisc.pinholeSpacing = this.spinningDisc.model.pinholeSpacing

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
                this.options.cancelled = false
                this.resolve(this.options)
                this.dialog = false
            },
            cancel() {
                this.options.cancelled = true
                this.resolve(this.options)
                this.dialog = false
            },
            tabChanged(number){
                this.tab = number
                this.valueChange()
            },
            setCookies() {
                this.$cookies.set('username',this.username, new Date(9999, 0o1, 0o1).toUTCString())
            },

          /*   getCookies() {
                if (this.$cookies.isKey('username') && this.$cookies.get('username') == this.username) {
                    if (this.$cookies.isKey('spdSettings')) {
                        this.spinningdisk = this.$cookies.get('spdSettings')
                    } else if (this.$cookies.isKey('airySettings')) {
                        this.airy = this.$cookies.get('airySettings')
                    } else if (this.$cookies.isKey('pointscanning')) {
                        this.pointscanning = this.$cookies.get('pointscanning')
                    }
                }
                
            }, */
            /* getModels() {
                if (this.$cookies.get('spdSettings')) {
                    this.spinningdisk.model = this.$cookies.get('spdSettings').model
                    this.spinningdisk.rphys = this.$cookies.get('spdSettings').rphys 
                    this.spinningdisk.phspg = this.$cookies.get('spdSettings').phspg 
                } else {
                    if (this.spinningdisk.model === 'Yokogawa X1 - 50') {
                        this.spinningdisk.rphys =  50
                        this.spinningdisk.phspg = 250
                    } else if (this.spinningdisk.model === 'Yokogawa W1 - 50') {
                        this.spinningdisk.rphys =  50
                        this.spinningdisk.phspg = 500
                    } else if (this.spinningdisk.model === 'Yokogawa W1 - 25') {
                        this.spinningdisk.rphys =  25
                        this.spinningdisk.phspg = 500
                    } else if (this.spinningdisk.model === 'Dragonfly - 40') {
                        this.spinningdisk.rphys =  40
                        this.spinningdisk.phspg =  700
                    } else if (this.spinningdisk.model === 'Dragonfly - 25') {
                        this.spinningdisk.rphys = 25
                        this.spinningdisk.phspg = 700
                    } 

                }
            }, */
           
            /* selectChange() {
                if (this.spinningdisk.model === 'Yokogawa X1 - 50') {
                        this.spinningdisk.rphys =  50
                        this.spinningdisk.phspg = 250
                    } else if (this.spinningdisk.model === 'Yokogawa W1 - 50') {
                        this.spinningdisk.rphys =  50
                        this.spinningdisk.phspg = 500
                    } else if (this.spinningdisk.model === 'Yokogawa W1 - 25') {
                        this.spinningdisk.rphys =  25
                        this.spinningdisk.phspg = 500
                    } else if (this.spinningdisk.model === 'Dragonfly - 40') {
                        this.spinningdisk.rphys =  40
                        this.spinningdisk.phspg =  700
                    } else if (this.spinningdisk.model === 'Dragonfly - 25') {
                        this.spinningdisk.rphys = 25
                        this.spinningdisk.phspg = 700
                    } 
                    this. valueChange()
                   
            }, */
            
            valueChange(){
                if(this.tab === 0) {
                    this.show = true

                    if(this.spinningDisc.objmagnification && this.spinningDisc.systemMagnification && this.spinningDisc.pinholesize && this.spinningDisc.pinholeSpacing && this.spinningDisc.auxmagnification ){
                        // follow: https://svi.nl/PinholeRadius
                        //this.options.pinholeRadius = 1000 * 0.5 * this.spinningDisc.pinholesize / (this.spinningDisc.mo * this.spinningDisc.systemMagnification * this.spinningDisc.ma)
                        this.options.pinholeRadius =  this.spinningDisc.pinholesize / (this.spinningDisc.objmagnification * this.spinningDisc.systemMagnification * this.spinningDisc.auxmagnification) / 2 * 1000                           
                        this.options.pinholeRadius = series.roundToTwo(this.options.pinholeRadius)
                        this.options.pinholeSpacingnm = (this.spinningDisc.pinholeSpacing / (this.spinningDisc.objmagnification * this.spinningDisc.systemMagnification * this.spinningDisc.auxmagnification) * 1000)
                        this.options.pinholeSpacingnm = series.roundToTwo(this.options.pinholeSpacingnm)
                    }

                    /* let spdSettings = {
                        mo:this.spinningdisk.mo, 
                        msys:this.spinningdisk.msys, 
                        rphys:this.spinningdisk.rphys, 
                        phspg:this.spinningdisk.phspg,
                        model:this.spinningdisk.model,
                        pinholeRadius: this.options.pinholeRadius,
                        pinholeSpacingnm: this.options.pinholeSpacingnm
                    }
                    this.$cookies.set('spdSettings',spdSettings, new Date(9999, 0o1, 0o1).toUTCString())
                    */
                }
              /*   else if(this.tab === 1) {
                    // here: https://svi.nl/DifficultiesCalculatingThePinhole
                    this.show = false
                    let shapefactor = 1
                    if(this.airy.shape === 'Circular')
                        shapefactor = 0.5
                    else if(this.airy.shape === 'Square') {
                        if(this.airy.square_side === 'Side') 
                            shapefactor = 0.564
                        else if(this.airy.square_side === 'Diagonal')
                            shapefactor = 0.399
                    }
                    // follow: https://svi.nl/PinholeRadius
                    this.options.pinholeRadius = 2 * shapefactor * this.airy.n * 0.61 * (this.airy.wavelength / this.airy.na)
                    this.options.pinholeRadius = series.roundToTwo(this.options.pinholeRadius)

                    let airySettings = {
                        n: this.airy.n,
                        wavelength: this.airy.wavelength,
                        na: this.airy.na, 
                        shape: this.airy.shape,
                        square_side: this.airy.square_side, 
                        pinholeRadius: this.options.pinholeRadius

                    }
                    this.$cookies.set('airySettings',airySettings, new Date(9999, 0o1, 0o1).toUTCString())

                } */
                else if(this.tab === 1) {
                    this.show = false
                    let shapefactor = this.pointscanning.shapeFactor
                    /* if(this.pointscanning.pinholeShape === 'Circular')
                        shapefactor = 0.5
                    else if(this.pointscanning.shape === 'Square') {
                        if(this.pointscanning.square_side === 'Side') 
                            shapefactor = 0.564
                        else if(this.pointscanning.square_side === 'Diagonal')
                            shapefactor = 0.399
                    } */
                    this.options.pinholeRadius = shapefactor *  this.pointscanning.rphys /
                                                        (this.pointscanning.mo * this.pointscanning.systemMagnification * this.pointscanning.ma)
                    this.options.pinholeRadius = series.roundToTwo(this.options.pinholeRadius)

                    /* let pointscanning = {
                        mo: this.pointscanning.mo,
                        msys: this.pointscanning.msys,
                        rphys: this.pointscanning.rphys,
                        shape: this.pointscanning.shape,
                        square_side: this.pointscanning.square_side,
                        pinholeRadius: this.options.pinholeRadius
                    }
                    this.$cookies.set('pointscanning',pointscanning, new Date(9999, 0o1, 0o1).toUTCString())
 */
                }
            },
            

        },
        mounted: function(){   
            this.setCookies()
            //this.getCookies() 
            //this.getModels()
            this.valueChange()
            //console.log(this.settings)
            
            
        }
    }

</script>