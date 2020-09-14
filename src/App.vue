<template>
    <v-app id="app">
        <navbar />
        <v-main>
            <notifications group="sysnotif" position="top left"/> 
            <v-container>
                <router-view />
            </v-container>
        </v-main>
    </v-app>
</template>

<script>
import Navbar from "./components/Navbar";

export default {
    name: "App",
    components: {
        Navbar
    }
};
</script>

<style>
* {
    text-transform: initial;
}

.v-list-group__header__prepend-icon {
    margin-right: 10px;
}
</style>
