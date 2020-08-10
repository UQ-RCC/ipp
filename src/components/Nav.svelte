<script>
	import { goto, stores } from '@sapper/app';
	const { page } = stores();

	import { mysession } from '../node_modules/mystore.js';
	mysession.useLocalStorage();
	
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
							<a class="menu__link" class:active="{$page.path === '/logout'}" href="/logout">
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
