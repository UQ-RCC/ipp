<template>
    <div>
        <v-row>
            <v-col>
                <file-browser
                    :axiosConfig="{baseURL: 'https://vuetify-file-browser-server.herokuapp.com/'}"
                    :maxUploadFileSize="0"
                />
            </v-col>
        </v-row>

        
    </div>
</template>

<script>
    // import * as api from '@/api'
    import FileBrowser from "../components/vuetify-file-browser/";

    export default {
        name: 'Filesmanager',
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