<template>
    <div>
        <v-progress-linear
            color="primary accent-4"
            indeterminate
            rounded
            height="4"
            :active="loading"
        ></v-progress-linear>
        <br />

        <v-row align="center" justify="center">
            <v-col cols="6" sm="4" md="2">
                <v-menu
                    ref="menu"
                    v-model="menu"
                    :close-on-content-click="false"
                    :return-value.sync="filters.start"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                >
                    <template v-slot:activator="{ on, attrs }">
                    
                        <v-text-field
                            v-model="filters.start"
                            readonly
                            label="Start time" type="string"
                            prepend-icon="mdi-calendar"
                            v-bind="attrs"
                            v-on="on"
                        ></v-text-field>
                    </template>
                        <v-date-picker
                            v-model="filters.start"
                            no-title
                        >
                        <v-spacer></v-spacer>
                        <v-btn text color="primary" @click="menu = false">
                            Cancel
                        </v-btn>
                        <v-btn text color="primary" @click="$refs.menu.save(filters.start)">
                            OK
                        </v-btn>
                    </v-date-picker>
                </v-menu>
            </v-col>
            <v-col cols="6" sm="4" md="2">
                <v-text-field
                    v-model="filters.username"
                    label="Username" type="string"
                ></v-text-field>
            </v-col>
            <v-col cols="6" sm="4" md="2">
                <v-select
                    :items="jobnames"
                    v-model="filters.jobname"
                    label="Job name"
                    dense
                    >
                </v-select>
            </v-col>
            <v-col cols="6" sm="4" md="2">
                <v-select
                    :items="statuses"
                    v-model="filters.status"
                    label="Job status"
                    dense
                    >
                </v-select>
            </v-col>
        </v-row>
        <v-row align="center" justify="center">
            <v-btn
                color="success"
                text
                @click="applyFilter"
            >Apply</v-btn>
            <v-btn
                color="warning"
                text
                @click="clearFilter"
            >Clear</v-btn>
        </v-row>
        <br />
        <v-card>
            <v-data-table
                :headers="jobTableHeaders"
                :items="jobs"
                :single-select="false"
                :disable-pagination="false"
                class="elevation-1"
                height="100%" width="100%"
            >
            <!-- remove this rom data table-->
            <!-- item-key="id" -->
            </v-data-table>            
        </v-card>
    </div>
</template>

<script>
    // import Vue from 'vue'
    // import DeconvolutionAPI from "@/api/DeconvolutionAPI.js"
    import PreferenceAPI from "@/api/PreferenceAPI"
    // import series from '@/utils/series.js'

    export default {
        name: 'Admin',
        components: {
        },
        data() {
            var data = {
                loading: false,
                menu: false,
                jobs: [],
                jobTableHeaders: [
                    { text: 'ID', value: 'id' },
                    { text: 'Username', value: 'username' },
                    { text: 'Slurm Jobid', value: 'jobid' },
                    { text: 'Jobname', value: 'jobname' },
                    { text: 'Status', value: 'status' },
                    { text: 'Start', value: 'start' },
                    { text: 'End', value: 'end' },
                    { text: 'Total', value: 'total' },
                    { text: 'Success', value: 'success' },
                    { text: 'Fail', value: 'fail' }                    
                ],
                jobnames: ['', 'ipp_convert', 'ipp_preprocess', 'ipp_decon'],
                statuses: ['', 'SUBMITTED', 'CANCELLED', 'FAILED', 'COMPLETE', 'RUNNING'],
                filters: {
                    status: null,
                    username: null, 
                    start: null,
                    jobname: null
                }
            }
            return data
        },
        mounted: async function() {
            let currentDatetime = new Date()
            this.filters.start = currentDatetime.getFullYear()  + "-01-01"
            await this.getJobs()
        },
        methods: {
            async getJobs(){
                if(this.$route.path !== '/adminJobs')
                    return
                this.loading = true
                this.jobs = await PreferenceAPI.filter_jobs(this.filters.status, this.filters.username, this.filters.start, this.filters.jobname)
                for(let i = 0; i< this.jobs.length; i++){
                    let job = this.jobs[i]
                    if(job.start) {
                        // convert to local timezone
                        job.start = new Date(Date.parse(job.start) + new Date().getTimezoneOffset())
                        // ot string
                        job.start = job.start.toLocaleString()
                    }
                    if(job.end){
                        job.end = new Date(Date.parse(job.end) + new Date().getTimezoneOffset())
                        job.end = job.end.toLocaleString()
                    }
                }
                this.loading = false
            },
            async applyFilter(){
                this.getJobs()
            },
            async clearFilter(){
                this.filters.status = null
                this.filters.username = null
                this.filters.start = null
                this.filters.jobname = null
                this.getJobs()
            },
        }
    }
</script>