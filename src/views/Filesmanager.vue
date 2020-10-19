<template>
    <div>
        <v-row>
            <v-col>
                <file-browser
                />
            </v-col>
        </v-row>

        
    </div>
</template>

<script>
    // import * as api from '@/api'
    import FileBrowser from "../components/vuetify-file-browser/";

    export default {
        name: 'FilesManager',
        components: {
            FileBrowser
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