function transformName(s) {
  return s
    .split('')
    .map(c => (c === ' ' ? '_' : c === '_' ? ' ' : c))
    .join('');
}

function urlEncodeString(s) {
  let result = '';
  for (let i = 0; i < s.length; ++i) {
    const c = s.charCodeAt(i);
    if (
      (c >= 0x00 && c <= 0x1f) ||
      c === 0x7f ||
      [
        ' ',
        '<',
        '>',
        '#',
        '%',
        '"',
        '!',
        '*',
        "'",
        '(',
        ')',
        ';',
        ':',
        '@',
        '&',
        '=',
        '+',
        '$',
        ',',
        '/',
        '?',
        '[',
        ']',
        '{',
        '}',
        '|',
        '^',
        '`',
      ].includes(s[i])
    ) {
      result += '%';
      result += '0123456789ABCDEF'[c >> 4];
      result += '0123456789ABCDEF'[c & 15];
    } else {
      result += s[i];
    }
  }
  return result;
}

function base64Char(x) {
  if (x < 0 || x >= 64) throw new Error('Invalid argument');
  return 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'[x];
}

function latToInt(lat, maxValue) {
  const x = ((lat + 90.0) / 180.0) * maxValue;
  return x < 0 ? 0 : x > maxValue ? maxValue : Math.round(x);
}

function lonIn180180(lon) {
  if (lon >= 0) return ((lon + 180.0) % 360.0) - 180.0;

  const l = ((lon - 180.0) % 360.0) + 180.0;
  return l < 180.0 ? l : l - 360.0;
}

function lonToInt(lon, maxValue) {
  const x = ((lonIn180180(lon) + 180.0) / 360.0) * (maxValue + 1.0) + 0.5;
  return x <= 0 || x >= maxValue + 1 ? 0 : Math.round(x);
}

function latLonToString(lat, lon, nBytes) {
  const kMaxCoordBits = 30;
  const kMaxPointBytes = 10;

  if (nBytes > kMaxPointBytes) nBytes = kMaxPointBytes;

  const latI = latToInt(lat, (1 << kMaxCoordBits) - 1);
  const lonI = lonToInt(lon, (1 << kMaxCoordBits) - 1);

  let s = '';
  for (let i = 0, shift = kMaxCoordBits - 3; i < nBytes; ++i, shift -= 3) {
    const latBits = (latI >> shift) & 7;
    const lonBits = (lonI >> shift) & 7;

    const nextByte =
      (((latBits >> 2) & 1) << 5) |
      (((lonBits >> 2) & 1) << 4) |
      (((latBits >> 1) & 1) << 3) |
      (((lonBits >> 1) & 1) << 2) |
      ((latBits & 1) << 1) |
      (lonBits & 1);

    s += base64Char(nextByte);
  }
  return s;
}

export const generateShortShowMapUrl = (lat, lon, zoom, name) => {
  let urlPrefix = 'ge0://ZCoordba64';

  const zoomI = zoom <= 4 ? 0 : zoom >= 19.75 ? 63 : Math.round((zoom - 4) * 4);
  urlPrefix = urlPrefix.slice(0, 6) + base64Char(zoomI) + urlPrefix.slice(7);

  latLonToString(lat, lon, 9)
    .split('')
    .forEach((c, i) => {
      urlPrefix = urlPrefix.slice(0, 7 + i) + c + urlPrefix.slice(8 + i);
    });

  let result = urlPrefix;
  if (name) {
    result += '/';
    result += urlEncodeString(transformName(name));
  }

  return result;
};
