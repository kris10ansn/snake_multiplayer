const noop = () => true;
const { floor, random } = Math;

module.exports = class Session {
	constructor(id) {
		this.id = id;
		this.clients = new Set();
		this.apples = [];

		this.apple();

		setInterval(() => {
			if (this.clients.size > 0) {
				this.apple();
			}
		}, 15000);
	}

	apple() {
		const apple = {
			x: floor(random() * 30),
			y: floor(random() * 30)
		};
		this.apples.push(apple);

		this.broadcast({
			type: "new-apple",
			apple
		});
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
