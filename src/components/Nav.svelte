<script>
	import { stores } from '@sapper/app';

	const { page, session } = stores();

	function signout(event){
		console.log("signing out");
	}

	function signin(event) {
		console.log("signing in");

		var base = 'https://nimrod.rcc.uq.edu.au/client/', oauthStart = 'login', service = 'wiener';
		var url = base + oauthStart + "?service="+service;
		var width = 800, 
			height = 600;
		var left = screen.width/2 - width/2,
			top = screen.height/2 - height/2;

		
		var loginWindow = window.open('about:blank', 
										'', 
										"top=" + top + ",left=" + left + ",width="+width+",height="+height
										);
		loginWindow.location = url;
		
	};
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

					{#if $session && $session.user}
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
							<a id="logout-btn" on:click="{signout}" class="menu__link">
								Logout
							</a>
						</li>					
					{:else}
						<li class="leaf">
							<a id="login" on:click="{signin}" class="menu__link">
								Sign in
							</a>
						</li>
					{/if}

	
				</ul>
			</div>
		</div>
	</div>
</nav>
