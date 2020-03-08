import Timer from "./Timer.js";
import Snake from "./Snake.js";
import ConnectionManager from "./ConnectionManager.js";
import { floor, random } from "./util.js";
import { Keyboard, setupKeyboard } from "./Keyboard.js";
import { Vec2 } from "./Vector.js";
import Apple from "./Apple.js";
import EventEmitter from "./EventEmitter.js";

export default class Game {
	constructor(size, playerId) {
		this.canvas = document.querySelector("canvas");
		this.ctx = this.canvas.getContext("2d");

		this.size = size;
		this.scale = this.canvas.width / size;

		this.player = new Snake(playerId, this.scale);

		const [x, y] = [floor(random() * size), floor(random() * size)];

		this.player.body.push(new Vec2(x, y));
		this.player.body.push(new Vec2(x - 1, y));

		this.peers = new Set();
		this.apples = new Set(); // Set<Apple>

		this.events = new EventEmitter();
		this.jobs = new Set();

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
		const id = random();

		this.jobs.forEach(job => {
			job.call();
		});

		this.jobs.clear();

		this.player.update(...args);

		if (this.player.collides({ snake: this.player, self: true })) {
			this.player.die();
		}

		this.apples.forEach(apple => {
			if (this.player.collides({ apple })) {
				this.jobs.add(() => this.removeApple(apple));
				this.player.extend();
			}
		});

		this.peers.forEach(peer => {
			if (this.player.collides({ snake: peer })) {
				this.player.die();
			}
		});
	}

	render() {
		this.ctx.fillStyle = "black";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.apples.forEach(it => it.render(this.ctx, "indigo"));

		this.player.render(this.ctx, "cyan");
		this.peers.forEach(it => it.render(this.ctx, "magenta"));
	}

	addPeers(...peers) {
		peers.forEach(peer => {});
	}

	removeApple(apple, emit = true) {
		this.apples.delete(apple);

		if (emit) {
			this.events.emit("remove-apple", apple);
		}
	}
}
