<template>
    <v-card>
        <v-card-text>
            <v-row align="center" no-gutters class="mb-2">
                <v-col cols="6" sm="4" md="4" lg="4">
                    <span class="font-weight-medium">Volume folder format</span>
                </v-col>
                <v-col cols="6" sm="4" md="4" lg="4">
                    <v-radio-group v-model="serie.volformat" row> 
                        
                        <v-radio
                            label="Unstructured"
                            value="unstructured"
                        ></v-radio>
                        <v-radio
                            label="Structured"
                            value="structured"
                        ></v-radio>
                    </v-radio-group> 
                                        
                </v-col>
            
            </v-row>
             <v-alert
                v-if="serie.volformat === 'structured'"
                icon="mdi-information-outline"
                outlined
                density="compact"
                class="mb-4"
            >
                You can directly import your volume into TeraStitcher if tiles are organized in <a
    href="https://github.com/abria/TeraStitcher/wiki/Supported-volume-formats#two-level-hierarchy-of-folders"
    target="_blank"
    rel="noopener noreferrer"
>
    two-level hierarchy of folders
</a>. Proceed to the next step. Otherwise, select "Unstructured" and provide the required information below to generate a descriptor file for your volume.
            </v-alert>
             <div v-if="serie.volformat === 'unstructured'">
                <p class="font-weight-medium mb-2">Move to two-level hierarchy folder structure</p>

                <v-row dense class="mb-2">
                    <v-col cols="6" sm="3">
                        <v-text-field dense outlined label="X" v-model="serie.format_x" />
                    </v-col>
                    <v-col cols="6" sm="3">
                        <v-text-field dense outlined label="Y" v-model="serie.format_y" />
                    </v-col>
                </v-row>

                <p class="font-weight-medium mb-1">Arrangement type</p>
                <p class="text-caption text-medium-emphasis mb-2">
                    Match your scan pattern to a diagram below.
                </p>

                <v-img
    src="/images/arrangements.png"
    alt="Reference diagram of the 8 arrangement types"
    contain
    class="mb-3"
/>

                <v-row dense class="mb-3">
                    <v-col cols="6" sm="3" v-for="n in 8" :key="n">
                        <v-btn
                            block
                            :variant="serie.arrangement_type === n ? 'flat' : 'outlined'"
                            :color="serie.arrangement_type === n ? 'primary' : undefined"
                            @click="selectArrangementType(n)"
                        >
                            Type {{ n }}
                        </v-btn>
                    </v-col>
                </v-row>

                <v-btn block color="primary" @click="generateDescriptor">
                    Generate XML descriptor
                </v-btn>
                </div>

           
        </v-card-text>
    </v-card>
</template>

<script>
    //import Vue from 'vue';

    export default {
        name: 'TerastitcherFormat',
        props: {
            readonly: { type: Boolean, default: false },
        },
        data() {
            return {
                serie: {},
            }
        },
        methods: {
            selectArrangementType(n) {
                this.serie.arrangement_type = n
            },
             generateDescriptor() {
                this.$emit('generate-descriptor', {
                    x: this.serie.format_x,
                    y: this.serie.format_y,
                    arrangementType: this.serie.arrangement_type,
                })
            },
            /* getFormat() {
                return {
                    structured: this.structured,
                    unstructured: this.unstructured,
                }
            }, */
            /* async loadFormat(format) {
                this.structured = format.structured || false
                this.unstructured = format.unstructured || false
            }, */
        },
    }
</script>

<style lang="scss" scoped>
</style>