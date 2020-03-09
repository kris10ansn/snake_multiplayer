import { abs, fixed, round, floor } from "./util.js";
import { Vec2 } from "./Vector.js";
import EventEmitter from "./EventEmitter.js";
import { loadImage } from "./loaders.js";

export default class Snake {
	constructor(id, scale) {
		this.id = id;

		this.scale = scale;
		this.step = 11;

		this.dead = false;
		this.deadTime = 0;

		this.vel = new Vec2(0, 0);
		this.nextVel = new Vec2(this.vel);

		this.events = new EventEmitter();
		this.inputs = [];
		this.body = [];
	}

	update(accumulated, tick) {
		if (this.dead) {
			this.deadTime += accumulated;

			if (this.deadTime > 2.16 && this.body.length > 0) {
				this.body.length = 0;
				this.events.emit("body", this.body);
			}

			return;
		}

		if (tick % this.step === 0) {
			// Only recent inputs (less than .3 sconds ago)
			this.inputs = this.inputs.filter(it => Date.now() - it.time < 300);

			const still =
				this.vel.array().reduce((a, b) => abs(a) + abs(b)) === 0;

			// Find the most recent input that was valid, and use it
			for (const index in this.inputs) {
				const { vec } = this.inputs[index];

				if (
					!(this.body.length > 1 && still && vec.x < 0) &&
					(this.body.length === 1 ||
						(this.vel.y === 0 && abs(vec.y) > 0) ||
						(this.vel.x === 0 && abs(vec.x) > 0))
				) {
					this.vel.set(vec);
					break;
				}
			}

			if (this.body.length === 0 || still) {
				return;
			}

			let next = this.head.add(this.vel, false);
			this.body.forEach(part => {
				let prev = new Vec2(part);
				part.set(next);

				next = prev;
			});

			this.events.emit("body", this.body);
		}
	}

	render(ctx, color) {
		ctx.fillStyle = color;

		if (this.dead) {
			ctx.fillStyle = floor(this.deadTime * 2) % 2 === 0 ? "red" : color;
		}

		this.body.forEach(({ x, y }) => {
			ctx.fillRect(
				x * this.scale,
				y * this.scale,
				this.scale,
				this.scale
			);
		});

		if (this.body.length > 0) {
			const prevAlpha = ctx.globalAlpha;
			const { x, y } = this.head;

			ctx.globalAlpha = 0.25;
			ctx.fillStyle = "black";
			ctx.fillRect(
				x * this.scale,
				y * this.scale,
				this.scale,
				this.scale
			);

			ctx.globalAlpha = prevAlpha;
		}
	}

	collides({ apple, snake, self = false }) {
		if (this.body.length === 0) {
			return false;
		}

		if (apple) {
			return this.head.x === apple.x && this.head.y === apple.y;
		}

		if (snake) {
			for (const i in snake.body) {
				const part = snake.body[i];

				if (self && i < 3) {
					continue;
				}

				if (this.head.x === part.x && this.head.y === part.y) {
					return true;
				}
			}
		}

		return false;
	}

	extend() {
		const lastIdx = this.body.length - 1;
		const last = this.body[lastIdx];

		if (this.body.length === 1) {
			this.body.push(last.sub(this.vel));
		} else {
			const secondLast = this.body[lastIdx - 1];
			const lastVel = secondLast.sub(last);

			this.body.push(last.sub(lastVel));
		}
	}

	die() {
		if (!this.dead) {
			this.deadTime = 0;
			this.dead = true;
			this.events.emit("body", []);
		}
	}

	dir(x, y) {
		this.inputs.unshift({
			vec: new Vec2(x, y),
			time: Date.now()
		});
	}

	get head() {
		return this.body[0];
	}
}
