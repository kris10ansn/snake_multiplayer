import EventEmitter from "./EventEmitter.js";
import Snake from "./Snake.js";

export default class ConnectionManager {
	constructor() {
		this.connection = null;
		this.events = new EventEmitter();

		this.game = null;
	}

	setGame(game) {
		this.game = game;

		this.listen(this.game.player);

		this.send({
			type: "state-update",
			name: "body",
			value: game.player.body,
			id: game.player.id
		});
	}

	connect(adress) {
		this.connection = new WebSocket(adress);

		this.connection.addEventListener("open", () => {
			console.log("Connection established");
			this.events.emit("open");
		});

		this.connection.addEventListener("message", event => {
			this.recieve(JSON.parse(event.data));
		});
	}

	listen(player) {
		player.events.listen("body", body => {
			this.send({
				type: "state-update",
				name: "body",
				value: body,
				id: player.id
			});
		});
	}

	recieve(data) {
		console.log("Recieved message", data);
		switch (data.type) {
			case "session-broadcast": {
				this.events.emit("session-broadcast", data);

				this.updateSession(data.peers);

				break;
			}

			case "state-update": {
				this.updateState(data);
				break;
			}
		}
	}

	send(msg) {
		console.log("Sending message", msg);
		const data = JSON.stringify(msg);
		this.connection.send(data);
	}

	updateState(update) {
		// Will only be added if it is not already in the set (check @addPlayer)
		this.addPlayer({ id: update.id });

		const player = Array.from(this.game.peers).find(
			it => it.id === update.id
		);

		player[update.name] = update.value;
	}

	updateSession(peers) {
		peers.clients.forEach(peer => {
			if (peer.id != peers.you) {
				this.addPlayer(peer);
			}
		});

		this.game.peers.forEach(peer => {
			if (peers.clients.find(it => it.id === peer.id) === undefined) {
				this.game.peers.delete(peer);
			}
		});
	}

	addPlayer(player) {
		if (
			[...this.game.peers].find(it => it.id === player.id) === undefined
		) {
			// Player isnt already added to the game
			const snake = new Snake(player.id, this.game.scale);

			player.state.body.forEach(part => {
				snake.body.push(part);
			});

			this.game.peers.add(snake);
		}
	}
}
