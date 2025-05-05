# React WebRTC Regions Metadata Parser

[![Build Status](https://github.com/giovannicalo/react-wrtc-parser-regions/actions/workflows/build.yml/badge.svg)](https://github.com/giovannicalo/react-wrtc-parser-regions/actions/workflows/build.yml)
[![Coverage Status](https://coveralls.io/repos/github/giovannicalo/react-wrtc-parser-regions/badge.svg?branch=master)](https://coveralls.io/github/giovannicalo/react-wrtc-parser-regions?branch=master)

## Installation

```bash
npm install giovannicalo/react-wrtc-parser-regions
```

> Not yet published to NPM. This will install it from GitHub.

## Usage

```javascript
import { Stream } from "react-wrtc";
import Decoder from "react-wrtc-decoder-webgl";
import Parser from "react-wrtc-parser-regions";

const stream = new Stream("ws://localhost:8080", null, new Decoder(new Parser()));

export default stream;
```

## API

### `new Parser(maximumRegions?: number = 16)`

Creates the parser, supporting up to `maximumRegions` regions, if provided (defaults to `16`).

#### `byteSize: number`

The size of the encoded data buffer, in bytes (8 bits).

#### `parse(data: Uint8Array): Promise<State>`

Parses the given data buffer into a structured regions state object.

The buffer must follow this binary layout, in little-endian byte order.

For the entire composite frame:

| Start | End | Size | Type   | Description    |
| ----- | --- | ---- | ------ | -------------- |
| 0     | 8   | 8    | uint64 | Timestamp (ms) |
| 8     | 10  | 2    | uint16 | Width          |
| 10    | 12  | 2    | uint16 | Height         |
| 12    | 14  | 2    | uint16 | Region count   |

Then, for each region, starting at offset 14 + 20 for each additional region:

| Start | End | Size | Type   | Description    |
| ----- | --- | ---- | ------ | -------------- |
| 0     | 2   | 2    | uint16 | Region ID      |
| 2     | 4   | 2    | uint16 | Source ID      |
| 4     | 12  | 8    | uint64 | Timestamp (ms) |
| 12    | 14  | 2    | uint16 | Width          |
| 14    | 16  | 2    | uint16 | Height         |
| 16    | 18  | 2    | uint16 | X coordinate   |
| 18    | 20  | 2    | uint16 | Y coordinate   |

Finally, after the regions, a [xxHash](https://github.com/Cyan4973/xxHash) XXH64 hash of the buffer up until that point:

| Start | End | Size | Type   | Description |
| ----- | --- | ---- | ------ | ----------- |
| 0     | 8   | 8    | uint64 | Hash        |

#### `pixelSize: number`

The size of the encoded data buffer, in pixels (32 bits).
