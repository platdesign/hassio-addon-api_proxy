'use strict';



module.exports = {
	name: 'logging',
	async register(server, options) {

		server.events.on('log', (e) => {
			let msg = `${new Date()}`;
			msg += ` [${e.tags.toString()}]`;

			if (e.data) {
				msg += ` ${JSON.stringify(e.data)}`;
			}

			console.log(msg);
		});

		server.events.on('request', req => {

			let msg = `${new Date()}`;

			msg += ' [';

			if (!req.auth.isAuthenticated) {
				msg += `UNAUTHORIZED]`;
			} else {
				msg += `app:${req.auth.credentials.name}]`;
			}

			msg += ` [${req.method.toUpperCase()}] ${req.path}`;



			console.log(msg);
		});

	}
}