import { floor, random } from "./util.js";

export default class Apple {
	constructor(x, y, gamesize, tilesize) {
		this.x = x;
		this.y = y;
		this.scl = tilesize;
		this.gamesize = gamesize;
	}

	render(ctx, color) {
		if (!(this.x && this.y)) {
			return;
		}

		ctx.fillStyle = color;
		ctx.fillRect(this.x * this.scl, this.y * this.scl, this.scl, this.scl);
	}
}
