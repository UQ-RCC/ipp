<script>
	import { onMount } from 'svelte';
	import { goto, stores } from '@sapper/app';
	const { page } = stores();

	import { mysession } from '../storage.js';
	mysession.useLocalStorage();
	
	import {config} from '../config.js';

	let keycloak = null;

	function login(){
		console.log("loging...........");
	}

	function logout(){
		console.log("lofout............");
		if(keycloak){
			keycloak.logout();
		}
	}

	// if token expired
	if ($mysession && $mysession.authenticated) {
		$mysession.onTokenExpired = function() {
			$mysession.updateToken(5).success(function(refreshed) {
				if (refreshed) {
					$mysession = kc;
				} else {
					console.log('Token is still valid');
				}
			}).error(function() {
				$mysession = null;
				goto('/login');
			});
		};
	}

	

	onMount(() => {
		import('keycloak-js').then(function(kcjs){
			let kc = kcjs.default;
			keycloak = kc({
				url: config.keycloak.url,
				realm: config.keycloak.realm,
				clientId: config.keycloak.clientId
			});
			keycloak.init({
				onLoad: config.keycloak.onLoad,
				checkLoginIframeInterval: 600
				}).success(function(authenticated) {
					$mysession = keycloak; // the whole thing
				}).error(function() {
					console.log('failed to initialize');
				});
			// when token expired
			keycloak.onTokenExpired = function() {
				keycloak.updateToken(5).success(function(refreshed) {
					if (refreshed) {
						$mysession = keycloak;
					} else {
						console.log('Token is still valid');
					}
				}).error(function() {
					$mysession = null;
					goto('/');
				});
			};
		}); 
	});


</script>


<nav>
	<div class="navigation">
		<div class="region region-navigation">
			<div id="block-system-main-menu" class="block block-system block-menu main-menu">
				<ul class="menu" id="main-menu">
					<li class="leaf">
						<a class="menu__link" class:active="{$page.path === '/'}" href="/">
							Home
						</a>
					</li>
					<li class="leaf">
						<a class="menu__link" href="https://support.rcc.uq.edu.au/imbmicroscopy" target="_blank">
							Support
						</a>
					</li>

					{#if $mysession && $mysession.authenticated}
						<li class="leaf">
							<a class="menu__link" class:active="{$page.path === '/filesmanager'}" href="/filesmanager">
								FilesManager
							</a>
						</li>
						<li class="leaf">
							<a class="menu__link" class:active="{$page.path === '/converter'}" href="/converter">
								Converter
							</a>
						</li>
						<li class="leaf">
							<a class="menu__link" class:active="{$page.path === '/preprocessing'}" href="/preprocessing">
								Proprocessing
							</a>
						</li>
						<li class="leaf">
							<a class="menu__link" class:active="{$page.path === '/deconvolution'}" href="/deconvolution">
								Deconvolution
							</a>
						</li>
						<li class="leaf">
							<a class="menu__link" class:active="{$page.path === '/joblist'}" href="/joblist">
								JobList
							</a>
						</li>

						<li class="leaf">
							<a class="menu__link" class:active="{$page.path === '/logout'}" href="/" on:click={logout}>
								Signout
							</a>
						</li>					
					{:else}
						<li class="leaf">
							<a class="menu__link" class:active="{$page.path === '/logout'}" href="/login">
								Signin
							</a>
						</li>
					{/if}

	
				</ul>
			</div>
		</div>
	</div>
</nav>
