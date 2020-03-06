import { round, abs } from "./util.js";
import { Vec2 } from "./Vector.js";
import EventEmitter from "./EventEmitter.js";

export default class Snake {
	constructor(id, scale) {
		this.id = id;

		this.step = 17;
		this.scale = scale;

		this.vel = new Vec2(0, 0);
		this.nextVel = new Vec2(this.vel);

		this.inputs = [];

		this.events = new EventEmitter();

		this.body = [];
	}

	update(accumulated, tick) {
		if (tick % this.step === 0) {
			// Only recent inputs (less than .5 sconds ago)
			this.inputs = this.inputs.filter(it => Date.now() - it.time < 500);

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
		this.body.forEach(({ x, y }) => {
			ctx.fillRect(
				x * this.scale,
				y * this.scale,
				this.scale,
				this.scale
			);
		});
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
