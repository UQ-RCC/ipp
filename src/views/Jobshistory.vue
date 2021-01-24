<template>
    <v-card :loading="loading">
        <v-data-table
            v-model="selected"
            :headers="jobTableHeaders"
            :items="jobs"
            :single-select="false"
            :disable-pagination="true"
            item-key="id"
            show-select
            class="elevation-1"
            height="400px" width="100%"
            @item-selected="selectedChanged"
        >
        </v-data-table>


    </v-card>
</template>

<script>
    // import * as api from '@/api'

    // import DeconvolutionAPI from "@/api/DeconvolutionAPI.js"
    import PreferenceAPI from "@/api/PreferenceAPI"
    // import series from '@/utils/series.js'


    export default {
        name: 'Jobshistory',
        components: {
        },
        data() {
            return {
                timer: null,
                loading: false,
                jobs: [],
                selected: [],
                jobTableHeaders: [
                    { text: 'ID', value: 'id' },
                    { text: 'Slurm Jobid', value: 'jobid' },
                    { text: 'Jobname', value: 'jobname' },
                    { text: 'Status', value: 'status' },
                    { text: 'Start', value: 'start' },
                    { text: 'End', value: 'end' },
                    { text: 'Total', value: 'total' },
                    { text: 'Success', value: 'success' },
                    { text: 'Fail', value: 'fail' }                    
                ],
            }
        },
        created: function() {
            this.timer = setInterval(() => {
                this.updateJobs()
            }, 5000)
        },
        mounted: async function() {
            await this.updateJobs()
        },
        methods: {
            /**
             * get jobs
             */
            async updateJobs(){
                this.loading = true
                // only list running and submitted jobs
                this.jobs = await PreferenceAPI.list_decon_jobs(false)
                // console.log(this.jobs)
                this.loading = false
            },

            /**
             * selected item changed
             */
            selectedChanged(anItem){
                console.log(anItem)
            }
        }
    }
</script>