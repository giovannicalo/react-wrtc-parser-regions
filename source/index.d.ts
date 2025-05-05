type Region = {
	height: number;
	id: number;
	source: number;
	time: number;
	width: number;
	x: number;
	y: number;
};

type Regions = {
	[key: number]: Region;
};

type ValidState = {
	height: number;
	isValid: true;
	regions: Regions;
	time: number;
	width: number;
};

type InvalidState = {
	isValid: false;
};

type State = ValidState | InvalidState;

declare class Parser {
	constructor(maximumRegions?: number = 16);
	get byteSize(): number;
	parse(data: Uint8Array): Promise<State>;
	get pixelSize(): number;
}

export = Parser;
