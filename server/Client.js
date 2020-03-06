module.exports = class Client {
	constructor(connection, id) {
		this.connection = connection;
		this.id = id;
		this.session = null;

		this.state = {
			body: []
		};
	}

	send(data) {
		this.connection.send(JSON.stringify(data), err => {
			if (err) {
				console.error(err);
			}
		});
	}
};
