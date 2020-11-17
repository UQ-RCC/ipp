<template>
    <v-form
        ref="devicesform"
        v-model="devices.valid"
        lazy-validation
        >
        <v-row align="center" justify="center">
            <v-switch
                v-model="devices.autoDetect"
                label="Autodetect"
                >
            </v-switch>
        </v-row>
        <v-col align="center" justify="center">
            <v-col cols="15" sm="3" md="4">
                <v-text-field 
                    dense 
                    outlined
                    type=number 
                    label="Number of instances [nodes]" 
                    v-model="devices.numberOfParallelJobs"
                >
                </v-text-field>
            </v-col>
            <v-col cols="15" sm="3" md="4">
                <v-text-field 
                    dense 
                    outlined
                    type=number 
                    label="Memory per job (GBs)" 
                    v-model="devices.mem"
                >
                </v-text-field>
            </v-col>
            <v-col cols="15" sm="3" md="4">
                <v-text-field 
                    dense 
                    outlined
                    type=number 
                    label="Number of GPUs per job" 
                    v-model="devices.gpus"
                >
                </v-text-field>
            </v-col>
        </v-col>
        
    </v-form>

</template>

<script>
    export default {
        name: 'DeconvolutionDevices',
        props: {
            // path of the series - can be file, folder
            path: String,
        },
        data() {
            return {
                devices:{
                    valid: true,
                    autoDetect: false,
                    numberOfParallelJobs: 1,
                    mem: 100,
                    gpus: 1, 
                }
            }
        },
        methods: {
            // load the settings from database - or else set to default
            async load(){
                this.$emit("loading", true);
            }
        },
        watch: {
            async path() {
                // path changed
                await this.load();
            },
        }
  }
</script>

<style lang="scss" scoped>
</style>