<template>
    <div class="navigation navBar">
        <div id="block-system-main-menu" class="block block-system block-menu main-menu">
            <ul class="menu" id="main-menu">
                <li class="leaf">
                    <router-link :to="{ name: 'Home' }" 
                        id="home-btn" title="portal" class="menu__link" 
                        v-bind:class="{ active: this.getRoutePath && this.getRoutePath == '/home' }">
                        Home
                    </router-link>
                </li>
                <li class="leaf">
                    <router-link :to="{ name: 'Filesmanager' }" 
                        id="filesmanager" title="filesmanager" class="menu__link" 
                        v-bind:class="{ active: this.getRoutePath && this.getRoutePath == '/filesmanager' }">
                        FilesManager
                    </router-link>
                </li>
                <li class="leaf">
                    <router-link :to="{ name: 'Converter' }" 
                        id="converter" title="converter" class="menu__link" 
                        v-bind:class="{ active: this.getRoutePath && this.getRoutePath == '/converter' }">
                        Converter
                    </router-link>
                </li>
                <li class="leaf">
                    <router-link :to="{ name: 'Preprocessing' }" 
                        id="preprocessing" title="preprocessing" class="menu__link"
                        v-bind:class="{ active: this.getRoutePath && this.getRoutePath == '/preprocessing' }">
                        Preprocessing
                    </router-link>
                </li>
                <li class="leaf">
                    <router-link :to="{ name: 'Deconvolution' }" 
                    id="deconvolution" title="deconvolution" class="menu__link"
                    v-bind:class="{ active: this.getRoutePath && this.getRoutePath == '/deconvolution' }">
                        Deconvolution
                    </router-link>
                </li>
                <li class="leaf">
                    <router-link :to="{ name: 'Jobs' }" 
                        id="jobshistory" title="jobshistory" class="menu__link"
                        v-bind:class="{ active: this.getRoutePath && this.getRoutePath == '/jobs' }">
                        JobList
                    </router-link>
                </li>
                
                <li class="leaf"><a id="faq-btn" href="https://support.rcc.uq.edu.au/imbmicroscopy" target="_blank" title="support" class="menu__link">Support</a></li>
                <li class="leaf"><a id="logout-btn" @click="doSignout()" title="signout" class="menu__link">Logout</a></li>
            </ul>
        </div>
    </div>
</template>


<script>
    import Config from '../config'
    
    export default {
        name: 'NavigationBar',
        data () {
            return {
                status: 'loading',
                user: null
            }
        },
        computed: {
            getRoutePath() {
                return this.$route.path;
            }
        },
        methods: {
            // singout
            doSignout: function(){
                console.log("Signing out .....")
                this.$keycloak.logout({'redirectUri': Config.signoutUrl})
            }
        }
    }
</script>

<style scoped>
 .navBar {
    margin-bottom: 10px;
 }
</style>