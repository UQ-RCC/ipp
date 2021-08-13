<template>
    <div>
        <desktop-manager-component :desktopManagerOnly=true />
    </div>
</template>

<script>
    import DesktopManagerComponent from "../components/DesktopManagerComponent.vue"

    export default {
        components: { DesktopManagerComponent },
        name: 'VirtualDesktopManager',
    }
</script>