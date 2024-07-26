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

  it("matches blake3 base32 multihash", async () => {
    result = await hashUtil.compareBinaryToMultibaseHashes(helloWorldBin, [
      "bdyqed6bziei6w4j2eilfyrwjbk4pb7mtthesakh5nuuisrfsh72365q",
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
      "bciqkleng2qf7iicajiarom6pw6yzbvrmmw7qxtndfnl3e56zvwpri2q", // bad
      "bciqkleng2qf7iicajiarom6pw6yzbvrmmw7qxtndfnl3e56zvwpri3q", // good
      "", // bad
    ]);
    expect(result).toBe(true);
  });

  it("fails with corrupted hash", async () => {
    result = await hashUtil.compareBinaryToMultibaseHashes(helloWorldBin, [
      "bciqkleng2qf7iicajiarom6pw6yzbvrmmw7qxtndfnl3e56zvwpri2q",
    ]);
    expect(result).toBe(false);
  });
});
