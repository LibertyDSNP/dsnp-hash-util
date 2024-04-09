import { CID } from "multiformats/cid";
import { blake2b256 } from "@multiformats/blake2/blake2b";
import type { Hasher } from "multiformats/hashes/hasher";
import { sha256 } from "multiformats/hashes/sha2";
import { decode, create } from "multiformats/hashes/digest";
import { base58btc } from "multiformats/bases/base58";
import { bases, bytes } from "multiformats/basics";
import * as raw from "multiformats/codecs/raw";
import * as Block from "multiformats/block";
import * as dagPb from "@ipld/dag-pb";
import { UnixFS } from "ipfs-unixfs";
import { importBytes } from "ipfs-unixfs-importer";
import { MemoryBlockstore } from "blockstore-core/memory";

function isEqualArray(first: Uint8Array, second: Uint8Array) {
  if (first.length != second.length) return false;
  for (let i = 0; i < first.length; i++)
    if (first[i] != second[i]) return false;
  return true;
}

type Base = {
  prefix: string;
  name: string;
  decode(encoded: string): Uint8Array;
};

const basesByPrefix: Record<string, Base> = Object.fromEntries(
  Object.entries(bases).map(([_k, codec]) => [codec.prefix, codec]),
);

const hashers: Record<number, Hasher<string, number>> = {};
hashers[sha256.code] = sha256;
hashers[blake2b256.code] = blake2b256;

const codecs: Record<number, object> = {};
codecs[dagPb.code] = dagPb;
codecs[raw.code] = raw;

/**
 * Decodes a multibase encoded hash
 * Does NOT throw errors
 * @param mbString - The multibase encoded string
 * @returns null if unable to decode or the base name, algorithm code, CID codec code (if the value was a CIDv1), and actual hash bytes
 */
export const fromMultibase = (
  mbString: string,
): {
  hash: Uint8Array;
  base: string;
  algCode: number;
  codec: number | undefined;
} | null => {
  const prefix = mbString[0];
  const base = basesByPrefix[prefix];
  if (base == null) {
    return null;
  }
  try {
    const decodedBase = base.decode(mbString);
    if (decodedBase[0] === 0x01) {
      // cidv1
      const cid = CID.parse(mbString);
      return {
        base: base.name,
        codec: cid.code,
        algCode: cid.multihash.code,
        hash: cid.multihash.digest,
      };
    }
    const multihash = decode(decodedBase);
    return {
      base: base.name,
      codec: undefined,
      algCode: multihash.code,
      hash: multihash.digest,
    };
  } catch (e) {
    return null;
  }
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
    if (debased.codec) {
      const inputCID = await generateCID(
        binary,
        debased.codec === raw.code,
        hashers[debased.algCode],
      );
      return inputCID === hash;
    }
    const hasher = hashers[debased.algCode];
    if (hasher) {
      const inputHash = await hasher.digest(binary);
      if (isEqualArray(debased.hash, inputHash.digest)) return true;
    }
    return false; // unknown/unsupported hash algorithm
  });
  return found !== undefined;
}

export async function generateCID(
  bytes: Uint8Array,
  isRaw: boolean = false,
  hasher: Hasher<string, number> = sha256,
): Promise<string> {
  let value;
  if (isRaw) {
    value = bytes;
    const block = await Block.encode({ value, codec: raw, hasher });
    return block.cid.toString();
  } else {
    // Note -- assumes dag-pb sha2-256
    const blockstore = new MemoryBlockstore();
    const entry = await importBytes(bytes, blockstore, {
      rawLeaves: bytes.length > 256 * 1024,
    });
    return entry.cid.toString();
  }
}
