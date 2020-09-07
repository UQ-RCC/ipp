import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/components/Home'
import Filesmanager from '@/components/Filesmanager'
import Converter from '@/components/Converter'
import Preprocessing from '@/components/Preprocessing'
import Deconvolution from '@/components/Deconvolution'
import Jobshistory from '@/components/Jobshistory'
import Admin from '@/components/Admin'

Vue.use(Router)

export default new Router({
  routes: [
    {
        path: '/home',
        name: 'Home',
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
    { path: '*', redirect: '/home' }  
  ]
})