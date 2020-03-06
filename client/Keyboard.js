export class Keyboard {
	constructor(window) {
		this.listeners = new Map();
		this.state = new Map();

		this.addEventListeners(window);
	}

	handle(event) {
		const key = event.code.toLowerCase();

		if (!this.listeners.has(key)) {
			return;
		}

		event.preventDefault();

		const keyState = event.type === "keydown" ? 1 : 0;

		if (this.state.get(key) === keyState) {
			return;
		}

		this.state.set(key, keyState);
		this.listeners.get(key).forEach(it => it(keyState));
	}

	listen(key, callback) {
		key = key.toLowerCase();
		const callbacks = this.listeners.get(key) || [];

		this.listeners.set(key, [...callbacks, callback]);
	}

	addEventListeners() {
		["keydown", "keyup"].forEach(eventName => {
			window.addEventListener(eventName, event => {
				this.handle(event);
			});
		});
	}
}

export function setupKeyboard(keyboard, player) {
	["keyw", "arrowUp"].forEach(eventName => {
		keyboard.listen(eventName, state => {
			if (state === 1) {
				player.dir(0, -1);
			}
		});
	});

	["keys", "arrowDown"].forEach(eventName => {
		keyboard.listen(eventName, state => {
			if (state === 1) {
				player.dir(0, 1);
			}
		});
	});

	["keyd", "arrowRight"].forEach(eventName => {
		keyboard.listen(eventName, state => {
			if (state === 1) {
				player.dir(1, 0);
			}
		});
	});

	["keya", "arrowLeft"].forEach(eventName => {
		keyboard.listen(eventName, state => {
			if (state === 1) {
				player.dir(-1, 0);
			}
		});
	});
}
