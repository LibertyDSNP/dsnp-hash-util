import * as hashUtil from "./index.js";

const helloWorldBin = new TextEncoder().encode("Hello World");
let result: boolean;

describe("hash_util", () => {
  it("matches sha2-256 base32 multihash", async () => {
    result = await hashUtil.compareBinaryToMultibaseHashes(helloWorldBin, [
      "bciqkleng2qf7iicajiarom6pw6yzbvrmmw7qxtndfnl3e56zvwpri3q",
    ]);
    expect(result).toBe(true);
  });

  it("matches sha2-256 base58btc multihash", async () => {
    result = await hashUtil.compareBinaryToMultibaseHashes(helloWorldBin, [
      "zQmZUxo3nDiuiBsGzWmnfpADcQGNxwp9gHNSCPk2BH3rwPK",
    ]);
    expect(result).toBe(true);
  });

  it("matches blake2b-256 base32 multihash", async () => {
    result = await hashUtil.compareBinaryToMultibaseHashes(helloWorldBin, [
      "budsaeia5yalxf3qboh27mfggopr4p6qra6um64t335ng3lntphutydi5aa",
    ]);
    expect(result).toBe(true);
  });

  it("matches blake2b-256 base58btc multihash", async () => {
    result = await hashUtil.compareBinaryToMultibaseHashes(helloWorldBin, [
      "z2Drjgb6G2RquwnV763LqhY6uxW1UcKm2qsGCVvb6STELtAfxxo",
    ]);
    expect(result).toBe(true);
  });

  it("fails when no hashes provided", async () => {
    result = await hashUtil.compareBinaryToMultibaseHashes(helloWorldBin, []);
    expect(result).toBe(false);
  });

  it("fails with empty string", async () => {
    result = await hashUtil.compareBinaryToMultibaseHashes(helloWorldBin, [""]);
    expect(result).toBe(false);
  });

  it("fails with bad input", async () => {
    result = await hashUtil.compareBinaryToMultibaseHashes(helloWorldBin, [
      "fail",
    ]);
    expect(result).toBe(false);
  });

  it("matches with combination of non-matching and matching hashes", async () => {
    result = await hashUtil.compareBinaryToMultibaseHashes(helloWorldBin, [
      "bciqkleng2qf7iicajiarom6pw6yzbvrmmw7qxtndfnl3e56zvwpri3r", // bad
      "bciqkleng2qf7iicajiarom6pw6yzbvrmmw7qxtndfnl3e56zvwpri3q", // good
      "", // bad
    ]);
    expect(result).toBe(true);
  });

  it("fails with corrupted hash", async () => {
    result = await hashUtil.compareBinaryToMultibaseHashes(helloWorldBin, [
      "bciqkleng2qf7iicajiarom6pw6yzbvrmmw7qxtndfnl3e56zvwpri3r",
    ]);
    expect(result).toBe(false);
  });

  it("matches cidv1 dag-pb sha2-256 base32", async () => {
    result = await hashUtil.compareBinaryToMultibaseHashes(helloWorldBin, [
      "bafybeic35nent64fowmiohupnwnkfm2uxh6vpnyjlt3selcodjipfrokgi",
    ]);
    expect(result).toBe(true);
  });

  it("matches cidv1 raw sha2-256 base32", async () => {
    result = await hashUtil.compareBinaryToMultibaseHashes(helloWorldBin, [
      "bafkreiffsgtnic7uebaeuaixgph3pmmq2ywglpylzwrswv5so7m23hyuny",
    ]);
    expect(result).toBe(true);
  });

  it("matches cidv1 dag-pb sha2-256 base32 for file >256k", async () => {
    const dsnpBin = new TextEncoder().encode("dsnp\n".repeat(60_000));
    result = await hashUtil.compareBinaryToMultibaseHashes(dsnpBin, [
      "bafybeiheexz5xlj5wzezzsdqzxm24k5ouuqoselxeu3s3pf2awokwfzea4",
    ]);
    expect(result).toBe(true);
  });
});
