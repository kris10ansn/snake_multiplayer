export default class EventEmitter {
	constructor() {
		this.listeners = new Set();
	}

	listen(name, callback) {
		const listener = { name, callback };
		this.listeners.add(listener);

		return listener;
	}

	removeListener(listener) {
		this.listeners.delete(listener);
	}

	emit(name, ...args) {
		this.listeners.forEach(listener => {
			if (listener.name === name) {
				listener.callback.call(listener, ...args);
			}
		});
	}
}
