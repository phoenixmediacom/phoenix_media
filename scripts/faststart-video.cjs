// One-off remux: move the MP4 "moov" atom before "mdat" (faststart) without ffmpeg.
// Browsers must download the whole file before playback when moov trails mdat.
const fs = require("fs");
const path = require("path");

const inputPath = process.argv[2];
const outputPath = process.argv[3];

const CONTAINER_TYPES = new Set(["moov", "trak", "mdia", "minf", "stbl", "edts", "mvex"]);

function parseBoxes(buf, start, end) {
  const boxes = [];
  let offset = start;
  while (offset + 8 <= end) {
    const size = buf.readUInt32BE(offset);
    const type = buf.toString("latin1", offset + 4, offset + 8);
    const boxSize = size === 0 ? end - offset : size;
    boxes.push({ type, start: offset, end: offset + boxSize, headerSize: 8 });
    offset += boxSize;
  }
  return boxes;
}

function patchChunkOffsets(buf, box, delta) {
  if (box.type === "stco") {
    const entryCount = buf.readUInt32BE(box.start + 12);
    for (let i = 0; i < entryCount; i++) {
      const p = box.start + 16 + i * 4;
      buf.writeUInt32BE(buf.readUInt32BE(p) + delta, p);
    }
  } else if (box.type === "co64") {
    const entryCount = buf.readUInt32BE(box.start + 12);
    for (let i = 0; i < entryCount; i++) {
      const p = box.start + 16 + i * 8;
      const hi = buf.readUInt32BE(p);
      const lo = buf.readUInt32BE(p + 4);
      const value = hi * 2 ** 32 + lo + delta;
      buf.writeUInt32BE(Math.floor(value / 2 ** 32), p);
      buf.writeUInt32BE(value >>> 0, p + 4);
    }
  } else if (CONTAINER_TYPES.has(box.type)) {
    const children = parseBoxes(buf, box.start + 8, box.end);
    for (const child of children) patchChunkOffsets(buf, child, delta);
  }
}

const original = fs.readFileSync(inputPath);
const topBoxes = parseBoxes(original, 0, original.length);

const ftyp = topBoxes.find((b) => b.type === "ftyp");
const moov = topBoxes.find((b) => b.type === "moov");
if (!ftyp || !moov) {
  throw new Error("Expected ftyp and moov top-level boxes");
}

if (moov.start < topBoxes.find((b) => b.type === "mdat").start) {
  console.log("moov already precedes mdat; no faststart needed.");
  fs.copyFileSync(inputPath, outputPath);
  process.exit(0);
}

const moovBuf = Buffer.from(original.subarray(moov.start, moov.end));
const delta = moovBuf.length;

// Patch chunk offsets inside the moov copy to account for it moving earlier in the file.
const moovTopChildren = parseBoxes(moovBuf, 8, moovBuf.length);
for (const child of moovTopChildren) patchChunkOffsets(moovBuf, child, delta);

const ftypBuf = original.subarray(ftyp.start, ftyp.end);
const restBuf = Buffer.concat([
  original.subarray(ftyp.end, moov.start),
  original.subarray(moov.end),
]);

const result = Buffer.concat([ftypBuf, moovBuf, restBuf]);
fs.writeFileSync(outputPath, result);
console.log("faststart written to", path.resolve(outputPath), "size:", result.length);
