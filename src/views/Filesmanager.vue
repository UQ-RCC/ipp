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
    import CollectionsAPI from "@/api/CollectionsAPI";

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
        mounted: async function() {
            if(this.$route.query.relpath){
                console.log("---->relative path:")
                console.log(this.$route.query.relpath)
                var _collectionName = this.$route.query.relpath.split('/')[0]
                if(_collectionName) {
                    let _relPatWithoutCollection = this.$route.query.relpath.replace(_collectionName+'/', '')
                    let _collectionResponse = await CollectionsAPI.list()
                    _collectionResponse.commandResult.map(_collectionItem => {
                        let _collectionPath = _collectionItem.output
                        if(!_collectionPath.endsWith("/")) {
                            _collectionPath = _collectionPath + '/'
                        }
                        if(_collectionPath.includes(_collectionName)){
                            let _fullPath = _collectionPath + _relPatWithoutCollection
                            if(!_fullPath.endsWith("/")) {
                                _fullPath = _fullPath + '/'
                            }
                            console.log("@Filemanager chapge path to:" + _fullPath)
                            this.$refs.filebrowser.pathChanged(decodeURIComponent(_fullPath))
                        }
                    })
                }
            }
        },
        methods: {
        }
    }
</script>