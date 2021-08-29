<template>
    <div>
        <div style="text-align: center">Git version <b><i>{{ git_hash }}</i></b></div>
        <div style="text-align: center">Git tag <b><i>{{ git_tag }}</i></b></div>
    </div>
</template>

<script>
    // import _ from 'lodash'
    export default {
        name: 'Release',
        data() {
            return {
                git_hash: "",
                git_tag: ""
            }
        },
        methods: {
        },
        mounted: function() {
            this.git_hash = process.env.VUE_APP_GIT_HASH
            this.git_tag = process.env.VUE_APP_GIT_TAG            
        }
    }
</script>