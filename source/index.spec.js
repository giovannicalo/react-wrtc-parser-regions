import xxhash from "xxhash-wasm";

import Parser from ".";

let buffer = null;

let hasher = null;

let parser = null;

const appendHash = (buffer, offset) => {
	buffer.writeBigUInt64LE(hasher.h64Raw(buffer.subarray(0, offset)), offset);
};

const encode = (buffer, { height, regions, time, width }, regionCount) => {
	buffer.writeBigUInt64LE(BigInt(time));
	buffer.writeUInt16LE(width, 8);
	buffer.writeUInt16LE(height, 10);
	buffer.writeUInt16LE(regionCount, 12);
	Object.values(regions).forEach(({ height, id, source, time, width, x, y }, index) => {
		const offset = 14 + index * 20;
		buffer.writeUInt16LE(id, offset);
		buffer.writeUInt16LE(source, offset + 2);
		buffer.writeBigUInt64LE(BigInt(time), offset + 4);
		buffer.writeUInt16LE(width, offset + 12);
		buffer.writeUInt16LE(height, offset + 14);
		buffer.writeUInt16LE(x, offset + 16);
		buffer.writeUInt16LE(y, offset + 18);
	});
};

beforeAll(async () => {
	hasher = await xxhash();
	parser = new Parser();
});

const object = {
	height: 648,
	isValid: true,
	regions: {
		1: { height: 216, id: 1, source: 6, time: Date.now(), width: 384, x: 0, y: 0 },
		2: { height: 216, id: 2, source: 7, time: Date.now(), width: 384, x: 384, y: 0 },
		3: { height: 216, id: 3, source: 8, time: Date.now(), width: 384, x: 0, y: 216 },
		4: { height: 216, id: 4, source: 9, time: Date.now(), width: 384, x: 384, y: 216 },
		5: { height: 216, id: 5, source: 10, time: Date.now(), width: 384, x: 0, y: 432 }
	},
	time: Date.now(),
	width: 768
};

const regionCount = Object.keys(object.regions).length;

const size = 14 + regionCount * 20;

const invalidObject = { isValid: false };

beforeEach(() => {
	buffer = Buffer.alloc(size + 8);
});

it("should parse a valid data buffer into an object", async () => {
	encode(buffer, object, regionCount);
	appendHash(buffer, size);
	await expect(parser.parse(new Uint8Array(buffer))).resolves.toEqual(object);
});

it("should return an invalid object if the data buffer's hash doesn't match its contents", async () => {
	encode(buffer, object, regionCount);
	buffer.writeBigUInt64LE(123456789n, size);
	await expect(parser.parse(new Uint8Array(buffer))).resolves.toEqual(invalidObject);
});

it("should return an invalid object if the data buffer doesn't have the advertised number of regions", async () => {
	encode(buffer, object, regionCount + 1);
	appendHash(buffer, size);
	await expect(parser.parse(new Uint8Array(buffer))).resolves.toEqual(invalidObject);
});

it("should return an invalid object if the data buffer doesn't have a header", async () => {
	await expect(parser.parse(new Uint8Array(8))).resolves.toEqual(invalidObject);
});
