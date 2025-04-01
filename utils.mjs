export function calcCenter(dimension1, dimension2) {
	return Math.round((dimension1 - dimension2) / 2);
}

export function getBase64(url) {
	return fetch(url)
		.then((response) => {
			if (response.ok) {
				return response.blob();
			}
			return Promise.reject(`Base64 encoding error: unable to fetch file at ${url}`);
		})
		.then((blob) => {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onloadend = function () {
					resolve(reader.result);
				};
				reader.onerror = reject;
				reader.readAsDataURL(blob);
			});
		})
		.catch(e => console.error(e));
}