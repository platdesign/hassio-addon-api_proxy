'use strict';

const { Server } = require('hapi');
const H2o2 = require('h2o2');
const AuthBearer = require('hapi-auth-bearer-token');
const fs = require('fs');
const config = require('config');

let options;
let hauri;
if (process.env.NODE_ENV === 'production') {
	options = JSON.parse(fs.readFileSync('/data/options.json', { encoding: 'utf8' }));
	hauri = `${config.get('hauri')}/{subpath}`;
} else {
	options = { apps: config.get('apps') };
	hauri = `${config.get('hauri')}/{subpath}?api_password=welcome`;
}



(async () => {

	const server = new Server({
		host: config.get('host'),
		port: config.get('port')
	});

	await server.register(require('./plugins/logging'));

	await server.register(AuthBearer);

	server.auth.strategy('bearer', 'bearer-access-token', {
		allowQueryToken: true,
		validate: async (request, token, h) => {
			let isValid = false;
			let credentials = {};
			let artifacts = false;

			let app = options.apps.find(app => app.token === token);

			if (app) {
				isValid = true;
				credentials = app;
			}

			return { isValid, credentials, artifacts };
		}
	});

	await server.register(H2o2);

	server.route({
		method: ['GET', 'PUT', 'POST', 'DELETE'],
		path: '/{subpath*}',
		config: {
			auth: 'bearer'
		},
		handler: (req, h) => {
			server.events.emit('request', [req]);
			return h.proxy({ uri: hauri });
		}
	});

	await server.start();
	server.log(['log'], 'Server started');

})().catch(err => {
	console.log(err);
	process.exit(1);
});