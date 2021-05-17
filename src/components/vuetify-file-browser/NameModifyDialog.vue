<template>
    <v-dialog
        v-model="dialog"
        max-width="30%"
    >
        <v-card>
            <v-toolbar dark dense flat>
                <v-toolbar-title class="white--text">Modify folder/file name</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
                <v-text-field regular 
                            label="File/folder name" 
                            v-model="options.name">
                        </v-text-field>

            </v-card-text>
            <v-card-actions class="pt-0">
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
        options: {
            name: "",
            cancelled: false
        }
    }),
    methods: {
        open(input) {
            this.dialog = true
            this.options.name = input
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