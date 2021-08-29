<template>
    <v-app id="app">
        <navbar v-if="!['/desktop'].includes(this.$router.currentRoute.path)" />
        <v-main>
            <notifications group="sysnotif" position="top left"/>
            <notifications group="datanotif" position="bottom right"/>
            <div>
                <router-view />
            </div>
        </v-main>
            <v-footer app>
                <v-row justify="end">
                    <a href="https://github.com/UQ-RCC/ipp">IPP</a>&nbsp;(
                        <div v-if="git_tag !== 'null'">
                            version <a href="git_tag_url">{{ git_tag }} </a>
                        </div>
                        <div v-else>
                            commit <a href="git_hash_url">{{ git_hash }} </a>
                        </div>
                    )
                </v-row>
            </v-footer>    

    </v-app>
</template>

<script>
import Navbar from "@/components/Navbar";

export default {
    name: "App",
    components: {
        Navbar
    },
    data() {
        return {
            git_hash: "",
            git_hash_url: "",
            git_tag: "",
            git_tag_url: "",
        }
    },
    mounted: function() {
        this.git_hash = process.env.VUE_APP_GIT_HASH
        this.git_hash_url = "https://github.com/UQ-RCC/ipp/commits/" + this.git_hash
        this.git_tag = process.env.VUE_APP_GIT_TAG
        this.git_tag_url =  "https://github.com/UQ-RCC/ipp/releases/tag/" + this.git_tag
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
