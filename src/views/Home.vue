<template>
    <div class="mx-3">
    <h3>Welcome to the Image Processing Portal,</h3><br/>
    Commissioned by <a href="https://imb.uq.edu.au/microscopy">IMB Microscopy</a> and jointly developed with <a href="https://rcc.uq.edu.au/">UQ RCC</a>.
    <p/> 
    
    The Portal is designed around the needs of optical microscopists to manage, convert, 
    pre-process and deconvolve datasets on the <a href="https://rcc.uq.edu.au/wiener">Wiener High Performance Cluster</a>. 
    <p/>

   <!--  <h3>Notices</h3>
    Scheduled maintenance occurs on the first Tuesday of the second month of each quarter (i know, confusing right!!!)<br />
    Last reported downtime: 31st August 2021 <br /> <p/>
    <p/> -->



    <h3>Feedback</h3>
    The IPP is currently undergoing active development, any general feedback, comments, queries are welcome <a href="https://github.com/UQ-RCC/ipp/discussions">here</a> (You will need a Github account to submit new items for discussion).<br />
    Any issues or bugs you encounter can be submitted directly from the page you experienced them on by clicking the feedback button <v-icon big>mdi-comment-processing-outline</v-icon>.<br />

    <br />

    <h3>HPC quota limit</h3>
    <v-row >
        <v-col >
            
                <!-- <v-card-text> -->
                    <v-table fixed-header >
                        <thead>
                            <tr>
                                <th class="text-left pa-4">File System</th>
                                <th class="text-left pa-4">Used (GB)</th>
                                <th class="text-left pa-4">Limit (GB) </th>
                                <th class="text-left pa-4">Files </th>
                                <th class="text-left pa-4">File Limit</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in current_quota" v-bind:key="item.fileSystem">
                                <td class="text-left pa-4">{{ item.fileSystem }} </td>
                                <td class="text-left pa-4">{{ item.used }} </td>
                                <td class="text-left pa-4">{{ item.usedLimit }}</td>
                                <td class="text-left pa-4">{{ item.files }}</td>
                                <td class="text-left pa-4">{{ item.fileLimit }}</td>

                            </tr>
                        </tbody>

                    </v-table>
                    <h4 style="color:orange">If the usage of /scratch or /home is close to the limit, please ensure you delete some files from your scratch or home folder to free up space </h4>
                <!-- </v-card-text> -->    
            
        </v-col>
    </v-row>
   <br />
    <h3>Firefox is the recommended browser for the Image Processing Portal</h3> 

</div>
</template>

<script>
    // import * as api from '@/api'
    import RemoteJobAPI from "@/api/RemoteJobAPI.js"

    export default {
        name: 'Home',
        components: {
        },
        data() {
            return {
                current_quota:[]
                
            }
        },
        mounted: async function() {
            console.log(this.$route.query.component)
            if(this.$route.query.component && this.$route.query.component=='filesmanager'){
                let forwardedPath = '/filesmanager'
                if(this.$route.query.path)
                    forwardedPath = forwardedPath + '?path=' + this.$route.query.path
                if(this.$route.query.relpath)
                    forwardedPath = forwardedPath + '?relpath=' + this.$route.query.relpath
                this.$router.push({ 
                    path: forwardedPath
                })
            }
             let response = await RemoteJobAPI.scratch_quota()
             if (response.commandResult) {
                response.commandResult.forEach(item => {
                    this.current_quota.push(item)
                    console.log(this.current_quota)
                    
                        /* this.current_quota.used = item.used
                        this.current_quota.useLimit = item.usedLimit
                        this.current_quota.files = item.files
                        this.current_quota.fileLimit = item.fileLimit */
                    
                })
             }

             console.log(this.current_quota)

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