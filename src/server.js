import sirv from 'sirv';
import express from 'express';
import compression from 'compression';
// import bodyParser from 'body-parser';
// import session from 'express-session';
// import sessionFileStore from 'session-file-store';
import * as sapper from '@sapper/server';

// const FileStore = sessionFileStore(session);

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';


const app = express();
 
// Configures the express session.
// app.use(session({
// 	store: new FileStore({path: process.env.NOW ? `/tmp/sessions` : `.sessions`}),
//     cookie: {
//         maxAge: 604800000,
//     },
//     secret: 'r66S3cret',
//     resave: true,
// 	rolling: true,
// 	saveUninitialized: true
// }))
 
// Setting default values and for debugging purposes
// app.use(function(req, res, next) {
//     console.log(req.session);
// 	if (typeof req.session.user === 'undefined') {
//         req.session.user = false;
//     }
//     next()
// })
 
// Initiates Sapper and adds the session variable to the Store.
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

