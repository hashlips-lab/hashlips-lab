import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

import { SEED_CACHE_FILE } from "./cache.constants";

export default class CacheManager {
  public seed!: string;

  constructor(private cachePath: string) {}

  public init(): void {
    if (this.seed !== undefined) {
      return;
    }

    if (!fs.existsSync(this.cachePath)) {
      fs.mkdirSync(this.cachePath);
    }

    const seedFilePath = this.getCachePath(SEED_CACHE_FILE);
    if (fs.existsSync(seedFilePath)) {
      this.seed = JSON.parse(fs.readFileSync(seedFilePath).toString()).seed;

      return;
    }

    const newSeed = crypto.randomBytes(128).toString("hex");
    const seedFileDir = path.dirname(seedFilePath);

    fs.mkdirSync(seedFileDir, { recursive: true });
    fs.writeFileSync(seedFilePath, JSON.stringify({ seed: newSeed }, null, 2));

    this.seed = newSeed;
  }

  public getCachePath(relativePath: string): string {
    return path.join(this.cachePath, relativePath);
  }

  public saveDataToCache(relativePath: string, data: any): void {
    fs.writeFileSync(
      this.getCachePath(relativePath),
      JSON.stringify({ seed: this.seed, data: data }, null, 2)
    );
  }
}
