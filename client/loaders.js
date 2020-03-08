export async function loadImage(src) {
	return new Promise(resolve => {
		const image = new Image();

		image.onload = () => {
			resolve(image);
		};

		image.src = src;
	});
}
