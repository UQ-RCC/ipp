<script>
	import { onMount } from 'svelte';
	import { mysession } from '../../storage.js';
	
	onMount(() => {
		console.log("????????????????checking @ deconvoltuion");
		console.log($mysession);
	});

</script>

<svelte:head>
	<title>IMB Image Processing Portal - Deconvolution</title>
</svelte:head>


<p>This is the 'Deconvolution' page. There's not much here.</p>