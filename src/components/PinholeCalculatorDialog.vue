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

            <v-tabs @change="tabChanged" fixed-tabs >
                <v-tab>Spinning disk</v-tab>
                <v-tab>Airy units</v-tab>
                <v-tab>Point scanning</v-tab>

                <v-tab-item>
                    <v-row align="center" justify="center">    
                        <v-col cols="20" sm="4" md="5">
                            <v-text-field regular 
                                type="number"
                                :rules="numberRules"
                                @change="valueChange" 
                                label="Objective magnification" 
                                v-model="spinningdisk.mo">
                            </v-text-field>
                            <v-text-field regular 
                                type="number" 
                                :rules="numberRules"
                                @change="valueChange" 
                                label="System magnification" 
                                v-model="spinningdisk.msys">
                            </v-text-field>
                            <v-select 
                                    id="models"
                                    :items="models"
                                    v-model="spinningdisk.model"
                                    label="Microscope model preset"
                                    @change="selectChange"
                                    return-object
                                     >
                            </v-select>
                                
                                <v-text-field regular 
                                type="number" 
                                :rules="numberRules"
                                @change="valueChange" 
                                label="Physical diameter (µm)" 
                                v-model="spinningdisk.rphys"
                                >
                            </v-text-field>
                            <v-text-field regular 
                            type="number" 
                            :rules="numberRules"
                            @change="valueChange" 
                            label="Pinhole spacing (µm)" 
                            v-model="spinningdisk.phspg"
                            >
                        </v-text-field>
                        
                    
                        </v-col>
                    </v-row>
                </v-tab-item>
                <v-tab-item>
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
                </v-tab-item>
                <v-tab-item>
                    <v-row align="center" justify="center">    
                        <v-col cols="20" sm="4" md="5">
                            <v-text-field regular 
                                type="number"
                                :rules="numberRules"
                                @change="valueChange" 
                                label="Objective magnification" 
                                v-model="pointscanning.mo">
                            </v-text-field>
                            <v-text-field regular 
                                type="number" 
                                :rules="numberRules"
                                @change="valueChange" 
                                label="System magnification" 
                                v-model="pointscanning.msys">
                            </v-text-field>
                            <v-text-field regular 
                                type="number" 
                                :rules="numberRules"
                                @change="valueChange" 
                                label="Physical diameter (µm)" 
                                v-model="pointscanning.rphys">
                            </v-text-field>
                            <v-row align="center" justify="center">
                                <v-col cols="15" sm="5" md="6">
                                    <v-select
                                        :items="shapes"
                                        v-model="pointscanning.shape"
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
                                        v-model="pointscanning.square_side"
                                        label="Report side"
                                        @change="valueChange"
                                        outlined
                                        return-object
                                        v-if="pointscanning.shape === 'Square'"
                                        >
                                    </v-select>
                                 </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-tab-item>                
            </v-tabs>

            <v-row align="center" justify="center">    
                <v-col cols="20" sm="4" md="5">        
                    <v-text-field regular 
                        type="number" 
                        label="Back Projected Pinhole radius (nm)" 
                        v-model="options.pinholeRadius"
                        disabled>
                    </v-text-field>
                </v-col>
            </v-row>

            <v-row align="center" justify="center" v-if="show">    
                <v-col cols="20" sm="4" md="5">        
                    <v-text-field regular 
                        type="number" 
                        label="Back Projected Pinhole spacing (nm)" 
                        v-model="options.pinholeSpacingnm"
                        disabled>
                    </v-text-field>
                </v-col>
            </v-row>

            <v-card-actions>
                <v-row align="center" justify="center">    
                <v-btn class="my-1" color="success" rounded dark large @click="agree"> 
                    OK
                </v-btn>
                <v-btn class="my-1" color="warning" rounded dark large @click="cancel"> 
                    Cancel
                </v-btn>
                </v-row>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    import Vue from 'vue'
    import series from "@/utils/series.js";
    import VueCookies from 'vue-cookies'
  
      
    Vue.use(VueCookies)
    

    export default {
        name: 'PinholeCalculatorDialog',
        data: () => ({
            tab: 0,
            dialog: false,
            resolve: null,
            reject: null,
            show: false,
            options:{
                pinholeRadius: 0,
                pinholeSpacingnm: 0,
                cancelled: false,
            },
            spinningdisk: {
                mo:  60,
                msys: 1,
                rphys: 50,
                phspg: 250,
                model: 'Yokogawa X1 - 50'
            },
            airy: {
                n: 1, 
                wavelength: 580, 
                na: 1.4, 
                shape: 'Circular',
                square_side: 'Side'
            }, 
            pointscanning: {
                mo: 60,
                msys: 1,
                rphys: 50,
                shape: 'Circular',
                square_side: 'Side'
            },
            shapes: ['Circular', 'Square'],
            square_sides: ['Side', 'Diagonal'],
            numberRules: [
                value => value && parseInt(value) && String(value).match(/^\d+(\.\d+)?$/).length > 0 || 'Must be a positive number'
            ],
            models: [   'Yokogawa X1 - 50','Yokogawa W1 - 50','Yokogawa W1 - 25','Dragonfly - 40','Dragonfly - 25'], 
           
           
        }),
        computed: {
            username: function() {
                return this.$keycloak && this.$keycloak.idTokenParsed ? this.$keycloak.idTokenParsed.email  : ''
            }
        },
        methods: {
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

            getCookies() {
                if (this.$cookies.isKey('username') && this.$cookies.get('username') == this.username) {
                    if (this.$cookies.isKey('spdSettings')) {
                        this.spinningdisk = this.$cookies.get('spdSettings')
                    } else if (this.$cookies.isKey('airySettings')) {
                        this.airy = this.$cookies.get('airySettings')
                    } else if (this.$cookies.isKey('pointscanning')) {
                        this.pointscanning = this.$cookies.get('pointscanning')
                    }
                }
                
            },
            getModels() {
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
            },
           
            selectChange() {
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
                   
            },
            
            valueChange(){
                if(this.tab === 0) {
                    this.show = true

                    if(this.spinningdisk.mo && this.spinningdisk.msys && this.spinningdisk.rphys && this.spinningdisk.phspg){
                        // follow: https://svi.nl/PinholeRadius
                        this.options.pinholeRadius = 1000 * 0.5 * this.spinningdisk.rphys /
                                                        (this.spinningdisk.mo * this.spinningdisk.msys)
                        this.options.pinholeRadius = series.roundToTwo(this.options.pinholeRadius)
                        this.options.pinholeSpacingnm = (1000 * this.spinningdisk.phspg) / (this.spinningdisk.mo * this.spinningdisk.msys)
                        this.options.pinholeSpacingnm = series.roundToTwo(this.options.pinholeSpacingnm)
                    }

                    let spdSettings = {
                        mo:this.spinningdisk.mo, 
                        msys:this.spinningdisk.msys, 
                        rphys:this.spinningdisk.rphys, 
                        phspg:this.spinningdisk.phspg,
                        model:this.spinningdisk.model,
                        pinholeRadius: this.options.pinholeRadius,
                        pinholeSpacingnm: this.options.pinholeSpacingnm
                    }
                    this.$cookies.set('spdSettings',spdSettings, new Date(9999, 0o1, 0o1).toUTCString())
                   
                }
                else if(this.tab === 1) {
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

                }
                else if(this.tab === 2) {
                    this.show = false
                    let shapefactor = 1
                    if(this.pointscanning.shape === 'Circular')
                        shapefactor = 0.5
                    else if(this.pointscanning.shape === 'Square') {
                        if(this.pointscanning.square_side === 'Side') 
                            shapefactor = 0.564
                        else if(this.pointscanning.square_side === 'Diagonal')
                            shapefactor = 0.399
                    }
                    this.options.pinholeRadius = shapefactor * 1000 * this.pointscanning.rphys /
                                                        (this.pointscanning.mo * this.pointscanning.msys)
                    this.options.pinholeRadius = series.roundToTwo(this.options.pinholeRadius)

                    let pointscanning = {
                        mo: this.pointscanning.mo,
                        msys: this.pointscanning.msys,
                        rphys: this.pointscanning.rphys,
                        shape: this.pointscanning.shape,
                        square_side: this.pointscanning.square_side,
                        pinholeRadius: this.options.pinholeRadius
                    }
                    this.$cookies.set('pointscanning',pointscanning, new Date(9999, 0o1, 0o1).toUTCString())

                }
            },
            

        },
        mounted: function(){   
            this.setCookies()
            this.getCookies() 
            this.getModels()
            this.valueChange()
            
            
        }
    }

</script>