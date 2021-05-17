<template>
    <v-card flat tile class="d-flex flex-column bookmark-card">
        <div class="scroll-y scroll-x">
            <v-list dense>
                <v-subheader>Collections</v-subheader>
                <v-list-item-group color="primary">
                    <v-list-item
                        v-for="collection in collections"
                        :key="collection.name"
                        @click="changePath(collection.path)"
                    >
                    <v-icon color="grey lighten-1">mdi-folder-outline</v-icon>
                        
                        <v-list-item-content>
                            <v-list-item-title  v-text="collection.name"></v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list-item-group>

                <v-subheader>Bookmarks</v-subheader>
                <v-list-item-group color="primary">
                    <v-list-item
                        v-for="bookmark in bookmarks"
                        :key="bookmark.name"
                        @click="changePath(bookmark.path)"
                    >
                        <v-tooltip top>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn icon v-bind="attrs" v-on="on">
                                    <v-icon color="grey lighten-1">mdi-folder-outline</v-icon>
                                </v-btn>
                            </template>
                            <span>{{ bookmark.path }}</span>
                        </v-tooltip>
                        
                        <v-list-item-content>
                            <v-list-item-title  v-text="bookmark.name"></v-list-item-title>
                        </v-list-item-content>

                        <v-btn icon @click="deleteBookmark(bookmark)">
                            <v-icon>mdi-delete-outline</v-icon>
                        </v-btn>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
        </div>
        
    </v-card>
</template>

<script>
    import PreferenceAPI from "@/api/PreferenceAPI";
    import CollectionsAPI from "@/api/CollectionsAPI";
    import Vue from 'vue';
    
    export default {
        name: 'Bookmark',
        props: {
            parentComponent: String, 
            prefid: Number,
            bookmarks: Array
        },
        data: () => (
            {
                collections: []
            }
        ),
        methods: {
            async deleteBookmark(item) {
                try{
                    await PreferenceAPI.remove_filexplorer_bookmark(this.parentComponent, this.prefid, item.id);
                    this.$emit("bookmark-changed");
                    Vue.notify({
                        group: 'sysnotif',
                        type: 'info',
                        title: 'Bookmark',
                        text: 'Bookmark deleted'
                    });
                }
                catch(err){
                    Vue.notify({
                        group: 'sysnotif',
                        type: 'error',
                        title: 'Bookmark',
                        text: 'Problem deleting bookmark, try again!' + String(err)
                    });
                }
            },
            async changePath(path){
                Vue.$log.info("change path:" + path);
                this.$emit("path-changed", path);
            }
        },
        async mounted() {
            this.collections = []
            try{
                let _collectionResponse = await CollectionsAPI.list()
                _collectionResponse.commandResult.map(_collectionItem => {
                    let _collectionPath = _collectionItem.output
                    if(!_collectionPath.endsWith("/")) {
                        _collectionPath = _collectionPath + '/'
                    }
                    this.collections.push({"name": _collectionPath, "path": _collectionPath})
                })
            }
            catch(err){
                Vue.$log.error(err);
            }
        }
    }
</script>

<style lang="scss" scoped>
.bookmark-card {
    height: 200px;
    width: 350px;
    
    .scroll-x {
        overflow-x: auto;
    }
    .scroll-y {
        overflow-y: auto;
    }
}
</style>