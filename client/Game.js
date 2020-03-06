import Timer from "./Timer.js";
import Snake from "./Snake.js";
import ConnectionManager from "./ConnectionManager.js";
import { floor, random } from "./util.js";
import { Keyboard, setupKeyboard } from "./Keyboard.js";
import { Vec2 } from "./Vector.js";

export default class Game {
	constructor(size, playerId) {
		this.canvas = document.querySelector("canvas");
		this.ctx = this.canvas.getContext("2d");

		this.scale = this.canvas.width / size;

		this.player = new Snake(playerId, this.scale);

		const [x, y] = [floor(random() * size), floor(random() * size)];
		this.player.body.push(new Vec2(x, y));

		this.player.body.push(new Vec2(x - 1, y));

		this.peers = new Set();

		this.keyboard = new Keyboard(window);
		setupKeyboard(this.keyboard, this.player);

		this.timer = new Timer({
			step: 1 / 60,
			update: (...args) => this.update(...args),
			render: () => this.render()
		});

		this.timer.start();
	}

	update(...args) {
		this.player.update(...args);
	}

	render() {
		this.ctx.fillStyle = "black";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.player.render(this.ctx, "cyan");

		this.peers.forEach(it => it.render(this.ctx, "magenta"));
	}

	addPeers(...peers) {
		peers.forEach(peer => {});
	}
}
