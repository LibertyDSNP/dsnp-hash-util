# Overview

This package is a TypeScript implementation of hash-related utilities to support [DSNP](https://dsnp.org/) applications and services.

## Background

DSNP anchors content to announcements via a URL and hashes.
This ensures integrity of resources and also provides for relocatable content, as hashes can be generated and verified regardless of location.

This library provides a simple implementation that checks whether a data "file" matches at least one of the hash values provided.

## Dependencies

This library uses [hash-wasm](https://github.com/Daninet/hash-wasm), which has fast WASM implementations of hash algorithms and should work in both server-side and browser environments.

# Usage

Given a `Uint8Array` and an array of strings representing DSNP hashes, use the following function to verify if there is a matching hash.

```
import { compareBinaryToMultibaseHashes } from "@dsnp/hash-util";

const result = await compareBinaryToMultibaseHashes(binaryU8A, hashes);
```

# Compatibility

The library will verify the following types of hashes:

- multihash values
  - `base32` multibase encoding (leading `'b'` character)
  - `sha2-256` or `blake3` hash (leading `0x12` or `0x1e` byte)
  - 256-bit hash length (`0x20` after hash indicator)

# Limitations

All comparisons are done in-memory, meaning that there is no attempt to limit the size of the byte array or memory requirements.
Callers should therefore perform their own sanity checks.

# Development

```
npm i
npm run build
npm run test
```

Please use the github issues area to report bugs or suggest enhancements.
Pull requests are gratefully welcomed.
