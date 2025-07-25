// Optimized SHA-256 implementation for mining operations
// This is a JavaScript implementation - in production, WebAssembly would be preferred

export async function sha256(data: Uint8Array): Promise<Uint8Array> {
  // Use native SubtleCrypto API for better performance
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hashBuffer);
  }
  
  // Fallback to JavaScript implementation
  return sha256JS(data);
}

function sha256JS(data: Uint8Array): Uint8Array {
  // SHA-256 constants
  const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
    0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
    0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
    0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ]);

  // Initial hash values
  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  // Pre-processing
  const msgLen = data.length;
  const bitLen = msgLen * 8;
  
  // Append bit '1' to message
  const paddedLen = Math.ceil((msgLen + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLen);
  padded.set(data);
  padded[msgLen] = 0x80;
  
  // Append length as 64-bit big-endian integer
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLen - 4, bitLen >>> 0, false); // Low 32 bits
  view.setUint32(paddedLen - 8, (bitLen / 0x100000000) >>> 0, false); // High 32 bits

  // Process message in 512-bit chunks
  for (let chunk = 0; chunk < paddedLen; chunk += 64) {
    const w = new Uint32Array(64);
    
    // Break chunk into sixteen 32-bit big-endian words
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(chunk + i * 4, false);
    }
    
    // Extend the sixteen 32-bit words into sixty-four 32-bit words
    for (let i = 16; i < 64; i++) {
      const s0 = rightRotate32(w[i - 15], 7) ^ rightRotate32(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rightRotate32(w[i - 2], 17) ^ rightRotate32(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    
    // Initialize working variables
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    
    // Main loop
    for (let i = 0; i < 64; i++) {
      const S1 = rightRotate32(e, 6) ^ rightRotate32(e, 11) ^ rightRotate32(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rightRotate32(a, 2) ^ rightRotate32(a, 13) ^ rightRotate32(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      
      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }
    
    // Add chunk's hash to result
    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }
  
  // Produce final hash value
  const result = new Uint8Array(32);
  const resultView = new DataView(result.buffer);
  resultView.setUint32(0, h0, false);
  resultView.setUint32(4, h1, false);
  resultView.setUint32(8, h2, false);
  resultView.setUint32(12, h3, false);
  resultView.setUint32(16, h4, false);
  resultView.setUint32(20, h5, false);
  resultView.setUint32(24, h6, false);
  resultView.setUint32(28, h7, false);
  
  return result;
}

function rightRotate32(value: number, amount: number): number {
  return ((value >>> amount) | (value << (32 - amount))) >>> 0;
}

// Utility functions for mining operations
export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

// Double SHA-256 for Bitcoin-style hashing
export async function doubleSha256(data: Uint8Array): Promise<Uint8Array> {
  const hash1 = await sha256(data);
  return sha256(hash1);
}

// Generate mining target from difficulty bits
export function difficultyToTarget(bits: number): string {
  const exponent = bits >> 24;
  const mantissa = bits & 0xffffff;
  const target = mantissa * Math.pow(2, 8 * (exponent - 3));
  return target.toString(16).padStart(64, '0');
}
