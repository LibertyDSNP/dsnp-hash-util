import { createBLAKE3, createSHA256 } from "hash-wasm";
import type { IHasher } from "hash-wasm/dist/lib/WASMInterface.d.ts";

function isEqualArray(first: Uint8Array, second: Uint8Array) {
  if (first.length != second.length) return false;
  for (let i = 0; i < first.length; i++)
    if (first[i] != second[i]) return false;
  return true;
}

const B32_ALPHABET = "abcdefghijklmnopqrstuvwxyz234567";
const B32_CODES = new Map(B32_ALPHABET.split("").map((k, i) => [k, i]));

function decodeBase32(input: string): Uint8Array | null {
  const length = input.length;
  const output = new Uint8Array((length * 5) / 8);

  let value = 0;
  let bits = 0;
  let index = 0;

  for (let i = 0; i < length; i++) {
    const code = B32_CODES.get(input[i]);
    if (code == undefined) return null;
    value = (value << 5) | code;
    bits += 5;

    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 255;
      bits -= 8;
    }
  }

  return output;
}

const hashers: Record<number, () => Promise<IHasher>> = {};

// See https://github.com/multiformats/multicodec/blob/master/table.csv
hashers[0x12] = createSHA256;
hashers[0x1e] = createBLAKE3;

/**
 * Decodes a multibase encoded hash
 * Does NOT throw errors
 * @param mbString - The multibase encoded string
 * @returns null if unable to decode or the base name, algorithm code, CID codec code (if the value was a CIDv1), and actual hash bytes
 */
export const fromMultibase = (
  mbString: string,
): {
  hasher: () => Promise<IHasher>;
  hash: Uint8Array;
} | null => {
  const prefix = mbString[0];
  if (prefix !== "b") return null; // only base32 lowercase
  const multihash = decodeBase32(mbString.substring(1));
  if (multihash == null) return null;
  if ((multihash[0] == 0x12 || multihash[0] == 0x1e) && multihash[1] == 0x20)
    return {
      hasher: hashers[multihash[0]],
      hash: multihash.subarray(2, 34),
    };
  return null;
};

async function findAsyncSequential<T>(
  array: T[],
  predicate: (identifier: T) => Promise<boolean>,
): Promise<T | undefined> {
  for (const identifier of array) {
    if (await predicate(identifier)) {
      return identifier;
    }
  }
  return undefined;
}

export async function compareBinaryToMultibaseHashes(
  binary: Uint8Array,
  hashes: string[],
): Promise<boolean> {
  const found = await findAsyncSequential(hashes, async (hash) => {
    const debased = fromMultibase(hash);
    if (debased === null) return false; // unknown base or parse error
    const hasher = debased.hasher;
    if (hasher) {
      const instance = await hasher();
      instance.init();
      instance.update(binary);
      const digest = instance.digest("binary");
      return isEqualArray(debased.hash, digest);
    }
    return false;
  });
  return found !== undefined;
}
