<template>
    <v-form
        ref="advancedform"
        v-model="advanced.valid"
        lazy-validation
        >
        <v-row >

        </v-row>

    </v-form>

</template>

<script>
    export default {
        name: 'DeconvolutionAdvanced',
        props: {
            // path of the series - can be file, folder
            path: String,
        },
        data() {
            return {
                advanced:{
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