<template>
    <v-card flat tile class="d-flex flex-column bookmark-card">
        <div class="scroll-y scroll-x">
            <v-list dense>
                <v-subheader>Bookmarks</v-subheader>
                <v-list-item-group v-model="item" color="primary">
                    <v-list-item
                        v-for="item in items"
                        :key="item.name"
                    >

                        <v-tooltip top>
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn icon v-bind="attrs" v-on="on">
                                    <v-icon color="grey lighten-1">mdi-folder-outline</v-icon>
                                </v-btn>
                            </template>
                            <span>{{ item.path }}</span>
                        </v-tooltip>
                        
                        <v-list-item-content>
                            <v-list-item-title  v-text="item.name"></v-list-item-title>
                        </v-list-item-content>

                        <v-btn icon @click="deleteBookmark(item)">
                            <v-icon>mdi-delete-outline</v-icon>
                        </v-btn>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
        </div>
        
    </v-card>
</template>

<script>
    export default {
    data: () => ({
      item: 1,
      items: [{"name": "blah1", "path": "/root/blah1/blah2/a/a/a/a/a/a/a/a/a/a/a/a/a/a/a/a/asdasd_asdasd/asdasd.asdasd/asdasdasd"}, 
                {"name": "blah2", "path": "/root/blah1/blah2a/a/a/a/a/a/a/a/asdasd_asdasd/asdasd.asdasd/asdasdasd"}, 
                {"name": "blah3", "path": "/root/blah1/blah2a/a/a/a/a/a/a/a/asdasd_asdasd/asdasd.asdasd/asdasdasd"}, 
                {"name": "blah4", "path": "/root/blah1/blah2a/a/a/a/a/a/a/a/asdasd_asdasd/asdasd.asdasd/asdasdasd"}, 
                {"name": "blah5", "path": "/root/blah1/blah2a/a/a/a/a/a/a/a/asdasd_asdasd/asdasd.asdasd/asdasdasd"}, 
                {"name": "blah6", "path": "/root/blah1/blah2a/a/a/a/a/a/a/a/asdasd_asdasd/asdasd.asdasd/asdasdasd"}, 
                {"name": "blah7", "path": "/root/blah1/blah2a/a/a/a/a/a/a/a/asdasd_asdasd/asdasd.asdasd/asdasdasd"}, 
                {"name": "blah8", "path": "/root/blah1/blah2a/a/a/a/a/a/a/a/asdasd_asdasd/asdasd.asdasd/asdasdasd"}],
    }),
    methods: {
        deleteBookmark(item) {
            console.log('deleting');
            console.log(item);
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