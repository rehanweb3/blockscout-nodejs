// Real ethereum blockie generator — replaces the ESM-only blo package
// Algorithm ported from blo (https://github.com/bloblessblob/blo)

const RANDOM_SCALE = 1 / (1 << 31 >>> 0);

function nextRandom(rseed) {
  const t = rseed[0] ^ (rseed[0] << 11);
  rseed[0] = rseed[1];
  rseed[1] = rseed[2];
  rseed[2] = rseed[3];
  rseed[3] = (rseed[3] ^ (rseed[3] >> 19) ^ t ^ (t >> 8)) >>> 0;
  return rseed[3] * RANDOM_SCALE;
}

function randSeed(seed) {
  const rseed = new Uint32Array([0, 0, 0, 0]);
  for (let i = 0; i < seed.length; i++) {
    rseed[i % 4] = (rseed[i % 4] << 5) - rseed[i % 4] + seed.charCodeAt(i);
  }
  return rseed;
}

function randomColor(rseed) {
  return [
    Math.floor(nextRandom(rseed) * 360),
    Math.floor(40 + nextRandom(rseed) * 60),
    Math.floor(
      (nextRandom(rseed) + nextRandom(rseed) + nextRandom(rseed) + nextRandom(rseed)) * 25
    ),
  ];
}

function imageData(address) {
  const rseed = randSeed(address.toLowerCase());
  const c = randomColor(rseed);
  const b = randomColor(rseed);
  const s = randomColor(rseed);
  const data = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    data[i] = Math.floor(nextRandom(rseed) * 2.3);
  }
  return [data, [b, c, s]];
}

function bloSvg(address) {
  const [data, [b, c, s]] = imageData(address);
  const paths = ['', ''];

  for (let i = 0, x, y; i < 32; i++) {
    if (data[i] === 0) continue;
    x = i & 3;
    y = i >> 2;
    const sq = ',' + y + 'h1v1h-1z';
    paths[data[i] - 1] += 'M' + x + sq + 'M' + (7 - x) + sq;
  }

  const hsl = (col) => 'hsl(' + col[0] + ' ' + col[1] + '% ' + col[2] + '%)';

  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" shape-rendering="optimizeSpeed">' +
    '<path fill="' + hsl(b) + '" d="M0,0H8V8H0z"/>' +
    '<path fill="' + hsl(c) + '" d="' + paths[0] + '"/>' +
    '<path fill="' + hsl(s) + '" d="' + paths[1] + '"/>' +
    '</svg>'
  );
}

function blo(address, size) {
  const svg = bloSvg(address);
  return 'data:image/svg+xml;base64,' + btoa(svg);
}

module.exports = { blo, bloSvg };
module.exports.blo = blo;
module.exports.bloSvg = bloSvg;
module.exports.default = { blo, bloSvg };
