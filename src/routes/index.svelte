<style>
	pbody {
		text-align: left;
		margin: 0 auto;
		max-width: 75em;
		display: block;
    }
</style>

<script>
	import { goto } from '@sapper/app';
	import { onMount } from 'svelte';

	import { mysession } from '../storage.js';
	
</script>

<svelte:head>
	<title>Image Processing Portal - Index</title>
</svelte:head>

<pbody>
	{#if $mysession && $mysession.authenticated } 
		<h1>You are already signed in.</h1>
	{:else}
		<h1>You are not signed in.</h1>
		<p>Please sign in to continue</p>
	{/if}
</pbody>
