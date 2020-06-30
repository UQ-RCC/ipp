<style>
	pbody {
		text-align: left;
		margin: 0 auto;
		max-width: 75em;
		display: block;
    }
</style>
<script>
	import { stores } from '@sapper/app';

	const { page, session } = stores();
</script>

<svelte:head>
	<title>IMB Image Processing Portal - Index</title>
</svelte:head>

<pbody>
	{#if $session && $session.user}
		<h1>You are already signed in.</h1>
	{:else}
		<h1>You are not signed in.</h1>
		<p>Please sign in to continue</p>
	{/if}
</pbody>
