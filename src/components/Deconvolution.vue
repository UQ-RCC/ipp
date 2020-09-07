<template>
    <v-card>
        <v-card-title class="text-center justify-center py-6">
            Some title
        </v-card-title>

        <v-tabs centered>
            <v-tabs-slider></v-tabs-slider>
            <v-tab>
                <v-icon left>mdi-settings</v-icon>
                Option 1
            </v-tab>
            <v-tab>
                <v-icon left>mdi-lock</v-icon>
                Option 2
            </v-tab>
            <v-tab>
                <v-icon left>mdi-access-point</v-icon>
                Option 3
            </v-tab>

            <v-tab-item>
                <v-card flat>
                    <v-card-text>
                        First tab
                    </v-card-text>
                </v-card>
            </v-tab-item>
            <v-tab-item>
                <v-card flat>
                    <v-card-text>
                        Second tab
                    </v-card-text>
                </v-card>
            </v-tab-item>
            <v-tab-item>
                <v-card flat>
                    <v-card-text>
                        Third tab
                    </v-card-text>
                </v-card>
            </v-tab-item>
        </v-tabs>
    </v-card>
</template>

<script>
    // import * as api from '@/api'

    export default {
        name: 'Deconvolution',
        components: {
        },
        data() {
            var data = {}
            return data
        },
        mounted: function() {
        },
        methods: {
        }
    }
</script>