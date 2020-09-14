import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Filesmanager from './views/Filesmanager.vue'
import Preprocessing from './views/Preprocessing.vue'
import Converter from './views/Converter.vue'
import Deconvolution from './views/Deconvolution.vue'
import Jobshistory from './views/Jobshistory.vue'
import Admin from './views/Admin.vue'
import Release from './views/Release.vue'

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
            path: '/converter',
            name: 'Converter',
            component: Converter
        },
        {
            path: '/preprocessing',
            name: 'Preprocessing',
            component: Preprocessing
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
        {
            path: '/admin',
            name: 'Admin',
            component: Admin
        },
        {
            path: '/release',
            name: 'Release',
            component: Release
        },
        { path: '*', redirect: '/home' }  
    ]
})
