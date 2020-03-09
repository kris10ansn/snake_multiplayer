import EventEmitter from "./EventEmitter.js";
import Snake from "./Snake.js";
import Apple from "./Apple.js";
import Game from "./Game.js";

export default class ConnectionManager {
	constructor() {
		this.connection = null;
		this.events = new EventEmitter();

		/** @type {Game} [this.game] */
		this.game = null;
	}

	setGame(game) {
		this.game = game;

		this.game.player.events.listen("body", body => {
			this.send({
				type: "state-update",
				name: "body",
				value: body,
				id: this.game.player.id
			});
		});

		this.game.events.listen("remove-apple", apple => {
			this.send({
				type: "remove-apple",
				apple
			});
		});

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

			this.connection.addEventListener("close", () => {
				console.log("Connection closed. Reloading...");
				window.location.reload();
			});
		});

		this.connection.addEventListener("message", event => {
			this.recieve(JSON.parse(event.data));
		});
	}

	recieve(data) {
		// console.log("Recieved message", data);
		switch (data.type) {
			case "session-broadcast": {
				this.events.emit("session-broadcast", data);

				this.updateSession(data);

				break;
			}

			case "state-update": {
				this.updateState(data);
				break;
			}

			case "new-apple": {
				this.addApple(data.apple);
				break;
			}

			case "remove-apple": {
				this.game.apples.forEach(apple => {
					if (apple.x === data.apple.x && apple.y === data.apple.y) {
						this.game.jobs.add(() =>
							this.game.removeApple(apple, false)
						);
					}
				});

				break;
			}
		}
	}

	send(msg) {
		// console.log("Sending message", msg);
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

	updateSession({ peers, apples }) {
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

		apples.forEach(apple => {
			this.addApple(apple);
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

	addApple(apple) {
		if (
			![...this.game.apples].some(
				it => it.x === apple.x && it.y === apple.y
			)
		) {
			this.game.apples.add(
				new Apple(apple.x, apple.y, this.game.size, this.game.scale)
			);
		}
	}
}
