export class Vec2 {
	constructor(x, y) {
		if (x instanceof Vec2) {
			const vec = x;
			this.x = vec.x;
			this.y = vec.y;
		} else {
			this.x = x;
			this.y = y;
		}
	}

	add(vec, set = false) {
		const result = new Vec2(this.x + vec.x, this.y + vec.y);
		if (set) {
			this.set(result);
		}
		return result;
	}

	sub(vec, set = false) {
		const result = new Vec2(this.x - vec.x, this.y - vec.y);

		if (set) {
			this.set(result);
		}

		return result;
	}

	array() {
		return [this.x, this.y];
	}

	set(vec) {
		let vector = vec;
		if (!(vec instanceof Vec2)) {
			vector = new Vec2(vec[0], vec[1]);
		}

		this.x = vector.x;
		this.y = vector.y;

		return this;
	}
}
