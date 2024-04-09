# Overview

This package is a TypeScript implementation of hash-related utilities to support [DSNP](https://dsnp.org/) applications and services.

## Background

DSNP anchors content to announcements via a URL and hashes.
This ensures integrity of resources and also provides for relocatable content, as hashes can be generated and verified regardless of location.

This library provides a simple implementation that checks whether a data "file" matches at least one of the hash values provided.

## Dependencies

This library utilizes a number of open source projects and the authors are grateful for the efforts of the following projects:

- [The Multiformats Project](https://multiformats.io/), which specifies multihashes, multibase encodings, and CIDs, among other things
- [IPLD](https://ipld.io/) (InterPlanetary Linked Data), used for the dag-pb codec
- [IPFS](https://ipfs.tech/) (InterPlanetary File System), a content addressed distributed file system

# Usage

Given a `Uint8Array` and an array of strings representing DSNP hashes, use the following function to verify if there is a matching hash.

```
import { compareBinaryToMultibaseHashes } from "@dsnp/hash-util";

const result = await compareBinaryToMultibaseHashes(binaryU8A, hashes);
```

It can also be used to generate the CID for a `Uint8Array` (this is used internally in `compareBinaryToMultibaseHashes`):

```
import { generateCID } from "@dsnp/hash-util";

const cidString = await generateCID(binaryU8A);
```

# Compatibility

The library will verify the following types of hashes:

- multihash values
  - any standard multibase encoding e.g. `base32` or `base58btc`
  - `sha2-256` or `blake2b-256` hash
- CID version 1 values as emitted by the default configuration of `ipfs add --cid-version=1 ...`
  - `base32` base encoding
  - `dag-pb` codec for input longer than 256*1024 bytes
  - `raw` codec for shorter (single-block) input
  - `sha2-256` hash

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
