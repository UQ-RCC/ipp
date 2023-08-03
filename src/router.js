import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Filesmanager from './views/Filesmanager.vue'
import Processing from './views/Processing.vue'
import Converter from './views/Converter.vue'
import Deconvolution from './views/Deconvolution.vue'
import Jobshistory from './views/Jobshistory.vue'
//import Admin from './views/Admin.vue'
import AdminJobs from './views/AdminJobs.vue'
import Configuration from './views/Configuration.vue'
import Macros from './views/Macros.vue'
// import Release from './views/Release.vue'
import Particlecounting from './views/Particlecounting.vue'
import Desktop from './views/Desktop.vue'
import Virtualdesktopmanager from './views/Virtualdesktopmanager.vue'

Vue.use(Router)

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home
        },
        {
            path: '/filesmanager',
            name: 'Filesmanager',
            component: Filesmanager
        },
        {
            path: '/desktopmanager',
            name: 'Virtualdesktopmanager',
            component: Virtualdesktopmanager
        },
        {
            path: '/converter',
            name: 'Converter',
            component: Converter
        },
        {
            path: '/processing',
            name: 'Processing',
            component: Processing
        },
        {
            path: '/deconvolution',
            name: 'Deconvolution',
            component: Deconvolution
        },
        {
            path: '/jobs',
            name: 'Jobs',
            component: Jobshistory
        },
        /* {
            path: '/admin',
            name: 'Admin',
            component: Admin
        }, */ 
        {
            path: '/adminJobs',
            name: 'AdminJobs',
            component: AdminJobs

        },
        {
            path: '/configuration',
            name: 'Configuration',
            component: Configuration

        },
        // {
        //     path: '/release',
        //     name: 'Release',
        //     component: Release
        // },
        {
            path: '/particlecounting',
            name: 'ParticleCounting',
            component: Particlecounting
        },
        {
            path: '/desktop',
            name: 'Desktop',
            component: Desktop
        },
        {
            path: '/macros',
            name: 'Macros',
            component: Macros
        },
        { path: '*', redirect: '/home' }  
    ]
})
