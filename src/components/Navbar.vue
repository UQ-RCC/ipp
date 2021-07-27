<template>
    <div>
        <v-app-bar
            :clipped-left="$vuetify.breakpoint.lgAndUp"
            app
            dark
            color="#49075e"
        >
            <v-app-bar-nav-icon @click.stop="drawer = !drawer" class="mr-0"></v-app-bar-nav-icon>
            <v-toolbar-title>
                <v-btn text to="/">
                    <span class="headline">Image Processing Portal</span>
                </v-btn>
            </v-toolbar-title>
            <div class="flex-grow-1"></div>
            <div v-if="$vuetify.breakpoint.smAndUp">
                <span>{{ this.email }}</span>
                <v-menu
                    left
                    bottom
                >
                    <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        icon
                        v-bind="attrs"
                        v-on="on"
                    >
                        <v-icon>mdi-menu-down</v-icon>
                    </v-btn>
                    </template>

                    <v-list dense>
                        <v-list-item
                            @click="signout()"
                        >
                        <v-list-item-icon>
                            <v-icon>mdi-logout</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>Logout</v-list-item-title>
                    </v-list-item>
                    </v-list>
                </v-menu>

            </div>
        </v-app-bar>
        <v-navigation-drawer v-model="drawer" fixed app :clipped="$vuetify.breakpoint.lgAndUp">
            <v-list>
                <v-list-item to="/">
                    <v-list-item-icon>
                        <v-icon>mdi-home</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title class="ml-n5">Home</v-list-item-title>
                </v-list-item>

                <v-list-item to="/filesmanager">
                    <v-list-item-icon>
                        <v-icon>mdi-folder-multiple</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title class="ml-n5">FilesManager</v-list-item-title>
                </v-list-item>

                <v-list-group
                    :value="true"
                    no-action
                    >
                    <template v-slot:activator>
                        <v-list-item-title>Light microscopy</v-list-item-title>
                    </template>

                    <v-list-item to="/converter">
                        <v-list-item-icon>
                            <v-icon>mdi-arrow-left-right</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title class="ml-n5">Converter</v-list-item-title>
                    </v-list-item>
                    <v-list-item to="/preprocessing">
                        <v-list-item-icon>
                            <v-icon>mdi-scissors-cutting</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title class="ml-n5">Preprocessing</v-list-item-title>
                    </v-list-item>

                    <v-list-item to="/deconvolution">
                        <v-list-item-icon>
                            <v-icon>mdi-send</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title class="ml-n5">Deconvolution</v-list-item-title>
                    </v-list-item>
                </v-list-group>


                <!-- <v-list-group
                    :value="true"
                    no-action
                    >
                    <template v-slot:activator>
                        <v-list-item-title>Electron microscopy</v-list-item-title>
                    </template>
                </v-list-group> -->

                <v-list-item to="/jobs">
                    <v-list-item-icon>
                        <v-icon>mdi-history</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title class="ml-n5">Jobs</v-list-item-title>
                </v-list-item>

                <v-list-item to="/release">
                    <v-list-item-icon>
                        <v-icon>mdi-information-variant</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title class="ml-n5">Release</v-list-item-title>
                </v-list-item>


                <v-list-item to="/admin" v-if="this.is_admin" disabled>
                    <v-list-item-icon>
                        <v-icon>mdi-account-supervisor</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title class="ml-n5">Admin</v-list-item-title>
                </v-list-item>

                
                <v-list-item href="https://uq-rcc.github.io/ipp-docs" target="_blank">
                    <v-list-item-icon>
                        <v-icon>mdi-help-circle-outline</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title class="ml-n5">Documentation</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>
    </div>
</template>

<script>
    import Vue from 'vue'
    export default {
        data: () => ({
            drawer: null
        }),
        computed: {
            email: function() {
                return this.$keycloak && this.$keycloak.idTokenParsed ? this.$keycloak.idTokenParsed.email  : ''
            },
            is_admin: function() {
                return this.$keycloak.hasRealmRole("admin")
            }
        },
        methods: {
            signout: function(){
                // signout
                this.$keycloak.logout({'redirectUri': Vue.prototype.$Config.signoutUrl})
            }
        }
    }
</script>

<style>
</style>
