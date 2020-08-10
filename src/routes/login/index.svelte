<script>
	import { goto } from '@sapper/app';
	import { onMount } from 'svelte';
	import ListErrors from '../../components/ListErrors.svelte';
	
	import { mysession } from '../../node_modules/mystore.js';
	mysession.useLocalStorage();


	let keycloak = null;
	let kc = null;

	
	onMount(() => {
		import('keycloak-js').then(function(kcjs){
			keycloak = kcjs.default;
			kc = keycloak({
				url: 'https://auth.rcc.uq.edu.au/auth/',
				realm: 'wiener',
				clientId: 'jsclient'
			});
			kc.init({
					onLoad: 'login-required',
					checkLoginIframeInterval: 600
					}).success(function(authenticated) {
						$mysession = {
									'authenticated': kc.authenticated, 
									'sessionId': kc.sessionId, 
									'subject': kc.subject, 
									'token': kc.token, 
									'refreshToken': kc.refreshToken
									};
						goto('/deconvolution');
					}).error(function() {
						console.log('failed to initialize');
					});
			// when token expired
			kc.onTokenExpired = function() {
				kc.updateToken(5).success(function(refreshed) {
					if (refreshed) {
						$mysession = {
									'authenticated': kc.authenticated, 
									'sessionId': kc.sessionId, 
									'subject': kc.subject, 
									'token': kc.token, 
									'refreshToken': kc.refreshToken
									};
					} else {
						console.log('Token is still valid');
					}
				}).error(function() {
					$mysession = null;
					goto('/login');
				});
			};
		}); 
	});

</script>

<svelte:head>
	<title>Sign in</title>
</svelte:head>
