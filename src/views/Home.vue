<template>
    <h1>
        Welcome to the Image Processing Portal!
    </h1>
</template>

<script>
    // import * as api from '@/api'

    export default {
        name: 'Home',
        components: {
        },
        data() {
            var data = {}
            return data
        },
        mounted: function() {
            console.log(this.$route.query.component)
            if(this.$route.query.component && this.$route.query.component=='filesmanager'){
                let forwardedPath = '/filesmanager'
                if(this.$route.query.path)
                    forwardedPath = forwardedPath + '?path=' + this.$route.query.path
                this.$router.push({ 
                    path: forwardedPath
                })
            }
        },
        methods: {
        }
    }
</script>

<style scoped>
    .mainContents{
        max-width: 1140px;
        width: 100%;
        text-align: left;        
    }
</style>