import xxhash from "xxhash-wasm";

class Parser {

	#hasher = null;

	#promise = null;

	constructor() {
		this.#promise = xxhash().then((hasher) => {
			this.#hasher = hasher;
		});
	}

	async parse(data) {
		if (!this.#hasher) {
			await this.#promise;
		}
		const view = new DataView(data.buffer);
		if (data.length < 14) {
			return { isValid: false };
		}
		const size = view.getUint16(12, true);
		const payloadSize = 14 + size * 20;
		if (data.length < payloadSize + 8) {
			return { isValid: false };
		}
		const hash = view.getBigUint64(payloadSize, true);
		const isValid = this.#hasher.h64Raw(data.slice(0, payloadSize)) === hash;
		if (!isValid) {
			return { isValid: false };
		}
		const regions = {};
		for (let i = 0; i < size; i++) {
			const offset = i * 20;
			const id = view.getUint16(14 + offset, true);
			regions[id] = {
				height: view.getUint16(28 + offset, true),
				id,
				source: view.getUint16(16 + offset, true),
				time: Number(view.getBigUint64(18 + offset, true)),
				width: view.getUint16(26 + offset, true),
				x: view.getUint16(30 + offset, true),
				y: view.getUint16(32 + offset, true)
			};
		}
		return {
			height: view.getUint16(10, true),
			isValid,
			regions,
			time: Number(view.getBigUint64(0, true)),
			width: view.getUint16(8, true)
		};
	}

}

export default Parser;
