import { importer } from 'ipfs-unixfs-importer'
import { MemoryBlockstore } from 'blockstore-core/memory'
import * as fs from 'node:fs'

// Where the blocks will be stored
const blockstore = new MemoryBlockstore()

// Import path /tmp/foo/
const source = [{
//  path: './out.txt',
  content: fs.createReadStream('./out.txt')
}
/*
, {
  path: '/tmp/foo/quxx',
  content: fs.createReadStream('/tmp/foo/quux')
}
*/
]

for await (const entry of importer(source, blockstore)) {
  console.info(entry)
}
