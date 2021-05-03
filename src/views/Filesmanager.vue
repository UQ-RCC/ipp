<template>
    <div>
        <v-row>
            <v-col>
                <file-browser ref="filebrowser"
                    :initialPath=initialPath
                    :mode=mode
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
            var data = {
                initialPath: this.$route.query.path,
                mode: 'manage'
            }
            return data
        },
        mounted: function() {
            // console.log(this.$route.query.path)
            // if(this.$route.query.path){
            //     // this.$refs.filebrowser.pathChanged("/")
            //     console.log("@Filemanager chapge path to:" + this.$route.query.path)
            //     this.$refs.filebrowser.pathChanged(decodeURIComponent(this.$route.query.path))
            // }
        },
        methods: {
        }
    }
</script>