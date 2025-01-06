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
                    ref="submitmenu"
                    v-model="submitmenu"
                    :close-on-content-click="false"
                    :return-value.sync="filters.sumbit"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                >
                    <template v-slot:activator="{ on, attrs }">
                    
                        <v-text-field
                            v-model="filters.submit"
                            readonly
                            label="Submitted Date" type="string"
                            prepend-icon="mdi-calendar"
                            v-bind="attrs"
                            v-on="on"
                        ></v-text-field>
                    </template>
                        <v-date-picker
                            v-model="filters.submit"
                            no-title
                        >
                        <v-spacer></v-spacer>
                        <v-btn text color="primary" @click="submitmenu = false">
                            Cancel
                        </v-btn>
                        <v-btn text color="primary" @click="$refs.submitmenu.save(filters.submit)">
                            OK
                        </v-btn>
                    </v-date-picker>
                </v-menu>
            </v-col>
            <!-- <v-col cols="6" sm="4" md="2">
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
                            label="Start Date" type="string"
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
            </v-col> -->
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
                //menu: false,
                submitmenu: false,
                jobs: [],
                jobTableHeaders: [
                    { text: 'ID', value: 'id' },
                    { text: 'Username', value: 'username' },
                    { text: 'Slurm Jobid', value: 'jobid' },
                    { text: 'Jobname', value: 'jobname' },
                    { text: 'Status', value: 'status' },
                    { text: 'Submitted', value: 'submitted' },
                    { text: 'Start', value: 'start' },
                    { text: 'End', value: 'end' },
                    { text: 'Total', value: 'total' },
                    { text: 'Success', value: 'success' },
                    { text: 'Fail', value: 'fail' }                    
                ],
                jobnames: ['', 'ipp_convert', 'ipp_preprocess', 'ipp_decon', 'ipp_macro'],
                statuses: ['', 'SUBMITTED', 'CANCELLED', 'FAILED', 'COMPLETE', 'RUNNING'],
                filters: {
                    status: null,
                    username: null, 
                    //start: null,
                    jobname: null,
                    submit: null
                }
            }
            return data
        },
        mounted: async function() {
            let currentDatetime = new Date()
            const year = currentDatetime.getFullYear();
            const month = String(currentDatetime.getMonth() + 1).padStart(2, '0'); 
            const day = String(currentDatetime.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            this.filters.submit = formattedDate
           
            await this.getJobs()
        },
        methods: {
            async getJobs(){
                if(this.$route.path !== '/adminJobs')
                    return
                this.loading = true
                this.jobs = await PreferenceAPI.filter_jobs(this.filters.status, this.filters.username, this.filters.jobname, this.filters.submit)
                 
                for(let i = 0; i< this.jobs.length; i++){
                    let job = this.jobs[i]
                    if(job.submitted) {
                        // convert to local timezone
                        let ms = Date.parse(job.submitted)
                        let utcdate = new Date()
                        utcdate.setTime(ms)
                        const localTimeString = utcdate.toLocaleString()

                        //let utcdate = new Date(job.submitted)
                        //const offsetMinutes = utcdate.getTimezoneOffset();
                        //let localtime = new Date(utcdate.getTime() - offsetMinutes * 60 * 1000)
                        //const localTimeString = localtime.toLocaleString()
                        this.jobs[i].submitted = localTimeString
                        console.log("job submitted "+ this.jobs[i].submitted)
                    }
                    if(job.start) {
                        let utcdate = new Date(job.start);
                        let localTimeString = utcdate.toLocaleString();
                        this.jobs[i].start = localTimeString
                        console.log(localTimeString);
                    }
                    if(job.end) {
                        let utcdate = new Date(job.end);
                        let localTimeString = utcdate.toLocaleString();
                        this.jobs[i].end = localTimeString
                        console.log(localTimeString);
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
                //this.filters.start = null
                this.filters.submit = null
                this.filters.jobname = null
                this.getJobs()
            },
        }
    }
</script>