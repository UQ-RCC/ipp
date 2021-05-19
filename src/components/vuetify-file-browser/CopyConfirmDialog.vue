<template>
    <v-dialog
        v-model="dialog"
        max-width="60%"
    >
        <v-card>
            <v-toolbar color="#49075e" dense flat>
                <v-toolbar-title class="white--text">Copy confirmation</v-toolbar-title>
            </v-toolbar>
            <div>
                <v-list subheader>
                    <v-subheader><b>Source</b></v-subheader>
                    <v-list-item
                        v-for="source in sources" :key="source"
                    >
                    {{ source }}
                    </v-list-item>
                </v-list>

                <v-list subheader>
                    <v-subheader><b>Destination</b></v-subheader>
                    <v-list-item>
                        {{ destination }}
                    </v-list-item>
                </v-list>

            </div>

            <v-card-actions class="pt-0">
                <v-switch
                    v-model="options.deleteSource"
                    color="warning"
                    label="Delete sources upon completion"
                    >
                </v-switch>
                <v-spacer></v-spacer>
                <v-alert
                        border="bottom"
                        type="error"
                        outlined
                        v-if="options.deleteSource"
                    >
                        This will delete source files/folders. Please consider carefully!
                </v-alert>
                <v-spacer></v-spacer>
                <v-btn class="my-1" color="warning" rounded dark large @click="cancel">Cancel</v-btn>
                <v-btn class="my-1" color="success" rounded dark large @click="agree">OK</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
/**
 * Vuetify Confirm Dialog component
 * https://gist.github.com/eolant/ba0f8a5c9135d1a146e1db575276177d
 *
 * Insert component where you want to use it:
 * <confirm ref="confirm"></confirm>
 *
 * Call it:
 * this.$refs.confirm.open('Delete', 'Are you sure?', { color: 'red' }).then((confirm) => {})
 * Or use await:
 * if (await this.$refs.confirm.open('Delete', 'Are you sure?', { color: 'red' })) {
 *   // yes
 * }
 * else {
 *   // cancel
 * }
 */
export default {
    data: () => ({
        dialog: false,
        resolve: null,
        reject: null,
        sources: [],
        destination: "",
        options: {
            deleteSource: false,
            cancelled: false
        }
    }),
    methods: {
        open(sources, dest) {
            this.dialog = true
            this.sources = sources
            this.destination = dest
            return new Promise((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;
            });
        },
        agree() {
            this.options.cancelled = false
            this.resolve(this.options);
            this.dialog = false;
        },
        cancel() {
            this.options.cancelled = true
            this.resolve(this.options);
            this.dialog = false;
        }
    }
};
</script>