<template>
    <div class="container">
        <ul>
            <li>home</li>
        </ul>
        <h1>
            Home
        </h1>
    </div>
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
            // this.$notify({
            //     group: 'sysnotif',
            //     type: 'success',
            //     title: 'Important message',
            //     text: 'Hello user! This is a notification!'
            // });
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