const defaultOptions = { step: 1 / 60 };

export default function Timer(options) {
	let last = 0;
	let acc = 0;
	let tick = 0;
	let step = options.step || defaultOptions.step;
	let frameId;

	function onFrame(time) {
		if (last !== null) {
			acc = acc + (time - last) / 1000;
			while (acc > step) {
				options.update(acc, tick);
				tick = tick + 1;
				acc = acc - step;
			}
		}
		last = time;
		options.render();
		frameId = requestAnimationFrame(onFrame);
	}

	function start() {
		last = null;
		frameId = requestAnimationFrame(onFrame);
	}

	function stop() {
		cancelAnimationFrame(frameId);
	}

	return { start, stop };
}
