<template>
    <div>
    <h3>Welcome to the Image Processing Portal,</h3><br/>
    Commissioned by <a href="https://imb.uq.edu.au/microscopy">IMB Microscopy</a> and jointly developed with <a href="https://rcc.uq.edu.au/">UQ RCC</a>.
    <br />
    <p/> 
    
    The Portal is designed around the needs of optical microscopists to manage, convert, 
    pre-process and deconvolve datasets on the <a href="https://rcc.uq.edu.au/wiener">Wiener High Performance Cluster</a>. 
    <p/>
    <h3>Requirements</h3>
    <b>Mandatory:</b>
    <ul>
        <li>You will need a <a href="https://research.uq.edu.au/rmbt/uqrdm">UQ RDM</a> Q collection to store your input and output datasets</li> 
        <li>When you create the collection, ensure you tick the "<i><b>The project data needs to be mounted on UQ HPC facilities</b></i>" 
            tickbox in the Data storage options section at the bottom of the webpage. This will create a "Q" collection that 
            is mountable on the Wiener HPC.</li> 
        <li>UQ VPN</li>
    </ul>
    <b>Preferable:</b>
    <ul>
        <li>You will probably want to mount the collection in your institute cache for faster data access</li>          
    </ul>
    <br />
    Once you have created your RDM Q collection, and have received an email from ITS stating that your collection 
        is ready to you, you can send an email to the IT administrators to gain access to the portal and to mount your 
        collections on the correct caches - use the following email template and copy the RDM collection shortnames 
        into the email - <a href="mailto:ITS@uq.edu.au,i.porebski@uq.edu.au,h.nguyen30@uq.edu.au?cc=microscopes@imb.uq.edu.au&subject=Wiener HPC Portal Access&body=Could you please provide me with access to the Wiener HPC via the Image Processing Portal%0A%0AI will also require the following RDM collections mounted on both Wiener and my institute caches%0A%0ABest regards,">email link</a>
</div>
</template>

<script>
    // import * as api from '@/api'

    export default {
        name: 'Home',
        components: {
        },
        data() {
            var data = {}
            return data
        },
        mounted: function() {
            console.log(this.$route.query.component)
            if(this.$route.query.component && this.$route.query.component=='filesmanager'){
                let forwardedPath = '/filesmanager'
                if(this.$route.query.path)
                    forwardedPath = forwardedPath + '?path=' + this.$route.query.path
                this.$router.push({ 
                    path: forwardedPath
                })
            }
        },
        methods: {
        }
    }
</script>

<style scoped>
    .mainContents{
        max-width: 1140px;
        width: 100%;
        text-align: left;        
    }
</style>