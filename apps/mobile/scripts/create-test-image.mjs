#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultOutputPath = resolve(__dirname, "..", "tmp", "hege-test-image.png");

const outputPath = resolve(process.argv[2] ?? defaultOutputPath);
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, createPng(256, 144));

console.log(outputPath);

function createPng(width, height) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = createChunk(
    "IHDR",
    Buffer.from([
      (width >>> 24) & 0xff,
      (width >>> 16) & 0xff,
      (width >>> 8) & 0xff,
      width & 0xff,
      (height >>> 24) & 0xff,
      (height >>> 16) & 0xff,
      (height >>> 8) & 0xff,
      height & 0xff,
      8,
      2,
      0,
      0,
      0
    ])
  );
  const idat = createChunk("IDAT", deflateSync(buildPixelData(width, height)));
  const iend = createChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function buildPixelData(width, height) {
  const rows = [];

  for (let y = 0; y < height; y += 1) {
    const row = Buffer.alloc(1 + width * 3);
    row[0] = 0;

    for (let x = 0; x < width; x += 1) {
      const offset = 1 + x * 3;
      const isBand = x > width * 0.18 && x < width * 0.82 && y > height * 0.22 && y < height * 0.78;
      const isInnerBand = x > width * 0.28 && x < width * 0.72 && y > height * 0.34 && y < height * 0.66;

      if (isInnerBand) {
        row[offset] = 233;
        row[offset + 1] = 238;
        row[offset + 2] = 213;
      } else if (isBand) {
        row[offset] = 63;
        row[offset + 1] = 95;
        row[offset + 2] = 67;
      } else {
        row[offset] = 27;
        row[offset + 1] = 48;
        row[offset + 2] = 34;
      }
    }

    rows.push(row);
  }

  return Buffer.concat(rows);
}

function createChunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(data.length, 0);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);

  return Buffer.concat([lengthBuffer, typeBuffer, data, crcBuffer]);
}

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc ^= byte;

    for (let bit = 0; bit < 8; bit += 1) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }

  return (~crc) >>> 0;
}
