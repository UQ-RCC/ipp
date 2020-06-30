import * as sapper from '@sapper/app';

sapper.start({
	target: document.querySelector('#sapper'),
	store: data => new Store(data)
});