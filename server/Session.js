const noop = () => true;

module.exports = class Session {
	constructor(id) {
		this.id = id;
		this.clients = new Set();
		this.apples = new Set();

		this.apple();

		setInterval(() => {
			this.apple();
		}, 10000);
	}

	apple() {
		console.log("New apple (NOT IMPLEMENTED)");
	}

	join(client) {
		if (client.session) {
			throw new Error("Client already in session");
		}
		this.clients.add(client);
		client.session = this;

		this.sessionUpdate();
	}

	leave(client) {
		if (client.session !== this) {
			throw new Error("Client not in session");
		}
		this.clients.delete(client);
		client.session = null;

		this.sessionUpdate();
	}

	broadcast(data, filter = noop) {
		[...this.clients].filter(filter).forEach(client => {
			client.send(data);
		});
	}

	sessionUpdate() {
		this.clients.forEach(client => {
			client.send({
				type: "session-broadcast",
				apples: this.apples,
				peers: {
					you: client.id,
					clients: [...this.clients].map(({ id, state }) => ({
						id,
						state
					}))
				}
			});
		});
	}
};
