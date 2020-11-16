<template>
    <v-form
        ref="devicesform"
        v-model="devices.valid"
        lazy-validation
        >
        <v-row >

        </v-row>

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
                    valid: true
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