<template>
    <v-dialog
        v-model="dialog"
        :max-width="1000"
        @keydown.esc="cancel"
    >
        <v-card>
            <v-toolbar dark color="primary" dense flat>
                <v-toolbar-title class="white--text">{{ title }}</v-toolbar-title>
            </v-toolbar>
            <v-textarea
                name="input-7-1"
                filled
                auto-grow
                :readonly="true"
                :value="message"
            ></v-textarea>
            <v-card-actions class="pt-0">
                <v-btn depressed color="primary" @click="close">OK</v-btn>
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
        message: null,
        title: null,
        options: {}
    }),
    methods: {
        open(title, message, options) {
            this.dialog = true;
            this.title = title;
            this.message = message;
            this.options = Object.assign(this.options, options);
            return new Promise((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;
            });
        },
        close() {
            this.resolve(true);
            this.dialog = false;
        },
    }
};
</script>