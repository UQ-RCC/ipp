<template>
    <v-dialog v-model="dialog" persistent max-width="70%">
        <v-card>
            <v-toolbar dark color="#49075e">
                <v-btn icon dark @click="cancel" title="Close this dialogue">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-card-title class="headline">
                    Feedback
                </v-card-title>
            </v-toolbar>


            <v-row>
                <v-col cols="12" sm="6" md="6"  class="mx-5">
                    <v-text-field label="Title" v-model="title" :rules="notEmptyRule"></v-text-field>
                    <v-textarea
                        label="Contents"
                        v-model="contents"
                        :rules="notEmptyRule"
                    ></v-textarea>
                    <v-select
                        :items="priorityTypes"
                        v-model="priority"
                        item-text="label"
                        item-value="value"
                        label="Priority"
                    >
                    </v-select>
                    
                    <v-card-actions>
                        <v-row align="center" justify="center">    
                        <v-btn class="my-1" color="success" rounded dark large @click="agree"> 
                            Submit
                        </v-btn>
                        <v-btn class="my-1" color="warning" rounded dark large @click="cancel"> 
                            Cancel
                        </v-btn>
                        </v-row>
                    </v-card-actions>
                    <h5>*Additional information collection: browser name, version and window/screen size</h5>
                </v-col>
                <v-spacer></v-spacer>
                <v-col cols="12" sm="6" md="5" align="center" class="mx-5">
                    <div align="left" class="mt-5">
                        Screenshot can be attached by selecting a file in your computer, or pasting directly to the white area below. 
                    </div>
                    <v-col>
                        <v-file-input show-size label="Screenshot" accept="image/*" v-model="file" @change="fileAdded" :rules="maxFileSize"></v-file-input>
                    </v-col>
                    <canvas style="border:1px solid grey;" max-width="100%" max-height="200" id="mycanvas" title="Paste screenshot here"></canvas>
                </v-col>
                
            </v-row>



        </v-card>
    </v-dialog>
</template>

<script>
    import Vue from 'vue'
    import FeedbackAPI from "@/api/FeedbackAPI"
    import * as platform from 'platform'
    export default {
        name: 'FeedbackDialog',
        data() {
            return {
                dialog: false,
                title: "",
                contents: "",
                file: null,
                imageBlob: null,
                notEmptyRule: [
                    value => !!value || 'Must not be empty'
                ], 
                maxFileSize: [
                    value => !value || value.size < 2000000 || 'Image size should be less than 2 MB!',
                ],
                platform: null,
                priority: 'Medium',
                priorityTypes: ['Low', 'Medium', 'High', 'Critical']
            }
        },
        methods: {
            open() {
                this.dialog = true
                this.title = ""
                this.contents = ""
                this.file = null
                this.imageBlob = null
                var canvas = document.getElementById("mycanvas")
                if (canvas) {
                    while (canvas.firstChild) {
                        canvas.removeChild(canvas.lastChild)
                    }
                    const context = canvas.getContext('2d');
                    context.clearRect(0, 0, canvas.width, canvas.height)
                    canvas.width = 300
                    canvas.height = 150
                }
                this.platform = platform
                console.log(this.platform)
            },
            agree() {
                this.dialog = false
                if (!this.title || !this.contents){
                    Vue.notify({
                        group: 'sysnotif',
                        type: 'error',
                        title: 'Missing input',
                        text: 'Title and contents cannot be empty'
                    })
                    return
                }
                let email = this.contents + "<p />Additional information:"
                email = email + "<br />Current page: " + this.$route.name
                email = email + "<br />Platform information: " +this.platform
                email = email + "<br />Window size(not including toolbar): " +window.innerWidth + "x" + window.innerHeight
                email = email + "<br />Screen size: " +screen.width + "x" + screen.height
                
                let file = this.file
                if (!this.file && this.imageBlob){
                    file = this.imageBlob 
                }
                if(file && file.size > 2000000) {
                    Vue.notify({
                        group: 'sysnotif',
                        type: 'error',
                        title: 'File must be less than 2MB',
                        text: 'Attached file is too big'
                    })
                    return
                }
                // send it
                let resp = FeedbackAPI.send_feedback(this.title, email, file, this.priority)
                console.log(resp)
                Vue.notify({
                        group: 'sysnotif',
                        type: 'info',
                        title: 'Feedback sent',
                        text: 'Your feedback has been sent. Please check your email.'
                    })
            },
            cancel() {
                this.dialog = false
            },
            fileAdded(){
                if(this.file){
                    var canvas = document.getElementById("mycanvas")
                    var ctx = canvas.getContext('2d')
                    // Create an image to render the blob on the canvas
                    var img = new Image()
                    // Once the image loads, render the img on the canvas
                    img.onload = function(){
                        // Update dimensions of the canvas with the dimensions of the image
                        canvas.width = this.width
                        canvas.height = this.height
                        // Draw the image
                        ctx.drawImage(img, 0, 0)
                    };
                    // Crossbrowser support for URL
                    var URLObj = window.URL || window.webkitURL
                    // Creates a DOMString containing a URL representing the object given in the parameter
                    // namely the original Blob
                    img.src = URLObj.createObjectURL(this.file)
                } else {
                    let canvas = document.getElementById("mycanvas")
                    const context = canvas.getContext('2d');
                    context.clearRect(0, 0, canvas.width, canvas.height)
                    canvas.width = 300
                    canvas.height = 150

                }
            },
            get_browser() {
                var ua=navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []; 
                if(/trident/i.test(M[1])){
                    tem=/\brv[ :]+(\d+)/g.exec(ua) || []; 
                    return {name:'IE',version:(tem[1]||'')};
                    }   
                if(M[1]==='Chrome'){
                    tem=ua.match(/\bOPR|Edge\/(\d+)/)
                    if(tem!=null)   {return {name:'Opera', version:tem[1]};}
                    }   
                M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
                if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
                return M[0] + " version " + M[1]
                // return {
                //     name: M[0],
                //     version: M[1]
                // }
            },
        },
        mounted: function(){
            let that = this
            window.addEventListener("paste", function(event){
                let images = []
                if(event.clipboardData == false){
                    return
                }
                var items = event.clipboardData.items
                if(items == undefined){
                    return
                }
                for (var i = 0; i < items.length; i++) {
                    // Skip content if not image
                    if (items[i].type.indexOf("image") == -1) continue
                    // Retrieve image on clipboard as blob
                    var blob = items[i].getAsFile()
                    images.push(blob)
                }

                if(images.length > 0){
                    that.imageBlob = images[0]
                    if(that.imageBlob){
                        var canvas = document.getElementById("mycanvas")
                        var ctx = canvas.getContext('2d')
                        // Create an image to render the blob on the canvas
                        var img = new Image()
                        // Once the image loads, render the img on the canvas
                        img.onload = function(){
                            // Update dimensions of the canvas with the dimensions of the image
                            canvas.width = this.width
                            canvas.height = this.height
                            // Draw the image
                            ctx.drawImage(img, 0, 0)
                        };
                        // Crossbrowser support for URL
                        var URLObj = window.URL || window.webkitURL
                        // Creates a DOMString containing a URL representing the object given in the parameter
                        // namely the original Blob
                        img.src = URLObj.createObjectURL(that.imageBlob)
                    }

                }
            }, false)
        }
    }
</script>