<template>
    <div>
        <br />
        <v-progress-linear
            color="primary accent-4"
            indeterminate
            rounded
            height="4"
            :active="loading"
        ></v-progress-linear>
        <br />
        <v-card>
            <v-data-table
                v-model="selected"
                :headers="jobTableHeaders"
                :items="jobs"
                :single-select="false"
                :disable-pagination="true"
                show-select
                class="elevation-1"
                height="400px" width="100%"
                @item-selected="selectedChanged"
            >
            <!-- remove this rom data table-->
            <!-- item-key="id" -->
            </v-data-table>            
        </v-card>
        <div style="text-align: center">
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn  class="my-3" 
                            color="primary"
                            @click.stop="updateJobs()"  
                            fab dark large 
                            v-bind="attrs" 
                            v-on="on">
                        <v-icon>mdi-refresh</v-icon>
                    </v-btn>
                </template>
                <span>Refresh jobs</span>
            </v-tooltip>

            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn  class="my-3" 
                            color="warning"
                            @click.stop="cancelSelected()"  
                            fab dark large 
                            v-bind="attrs" 
                            v-on="on">
                        <v-icon>mdi-cancel</v-icon>
                    </v-btn>
                </template>
                <span>Cancel selected</span>
            </v-tooltip>

            
        </div>
    </div>
</template>

<script>
    // import * as api from '@/api'
    import Vue from 'vue'
    // import DeconvolutionAPI from "@/api/DeconvolutionAPI.js"
    import PreferenceAPI from "@/api/PreferenceAPI"
    import RemoteJobAPI from "@/api/RemoteJobAPI"
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
            }, 30000)
        },
        mounted: async function() {
            await this.updateJobs()
        },
        methods: {
            /**
             * get jobs
             * also get slurm jobs
             */
            async updateJobs(){
                if(this.$route.path !== '/jobs')
                    return
                this.loading = true
                // only list running and submitted jobs
                this.jobs = await PreferenceAPI.list_jobs(false)
                // console.log(this.jobs)
                let response = await RemoteJobAPI.list_jobs()
                Vue.$log.debug("Remote jobs response :")
                Vue.$log.debug(response)
                response.commandResult.forEach(remoteJob => {
                    let found = false
                    this.jobs.forEach( aJob => {
                        if(remoteJob.jobid == aJob.jobid)
                            found = true
                    })
                    if (!found) {
                        if (remoteJob.jobName.includes('ipp_decon') || remoteJob.jobName.includes('ipp_convert') || remoteJob.jobName.includes('ipp_preprocess'))
                            console.log("Not added, ipp job")
                        else
                            this.jobs.push({'jobid': remoteJob.jobid,
                                        'jobname': remoteJob.jobName,
                                        'status': remoteJob.status, 
                                        'id': null, 
                                        'total': 0,
                                        'success': 0,
                                        'fail': 0
                                        })
                    }
                });
                this.loading = false
            },

            /**
             * selected item changed
             */
            selectedChanged(anItem){
                Vue.$log.debug(anItem)
                if(anItem.value)
                    this.selected.push(anItem.item)
            },

            /**
             * cancel selected item
             */
            async cancelSelected(){
                Vue.$log.debug("Deleting:")
                Vue.$log.debug(this.selected)
                let update = false
                for(let _index = 0; _index < this.selected.length; _index++){
                    let job = this.selected[_index]
                    if(job.id) {
                        // call preference api to delete it
                        try{
                            // now cnacel the job correspdong to this decon job
                            if(job.jobid && typeof(job.jobid) == 'number') {
                                await RemoteJobAPI.stop_job(job.jobid)
                            }
                            await PreferenceAPI.cancel_job(job.id)
                            update = true
                        }
                        catch(err) {
                            Vue.$log.error(err)
                            Vue.notify({
                                group: 'sysnotif',
                                type: 'error',
                                title: 'Problem deleting job',
                                text: 'Problem deleting job, try again!'
                            })
                        }// end catch
                    } 
                    // not decon job
                    else if(job.jobid) {
                        try{
                            console.log("Deleting remote job : "+ job.jobid)
                            await RemoteJobAPI.stop_job(job.jobid)
                            update = true
                        }
                        catch(err) {
                            Vue.$log.error(err)
                            Vue.notify({
                                group: 'sysnotif',
                                type: 'error',
                                title: 'Problem deleting job',
                                text: 'Problem deleting job, try again!'
                            })
                        }// end catch
                    }
                    else {
                        console.log("Do nothing")
                        console.log(job.jobid)
                    }
                }
                if(update){
                    await this.updateJobs()
                    Vue.notify({
                        group: 'sysnotif',
                        type: 'success',
                        title: 'Job deletion',
                        text: 'Selected job(s) deleted!'
                    })
                }
            }
        }
    }
</script>