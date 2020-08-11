import sirv from 'sirv';
import express from 'express';
// import polka from 'polka';
import compression from 'compression';
import * as sapper from '@sapper/server';

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

// polka() // You can also use Express
// 	.use(
// 		compression({ threshold: 0 }),
// 		sirv('static', { dev }),
// 		sapper.middleware()
// 	)
// 	.listen(PORT, err => {
// 		if (err) console.log('error', err);
// 	});

const app = express();

app.use(
	compression({ threshold: 0 }),
	sirv('static', { dev }),
sapper.middleware({
	session: (req, res) => ({
		// user: req.session.user
	})
})
)

app.listen(PORT, err => {
	if (err) console.log('error', err);
});
