import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

import {
  GENERATORS_CACHE_FILE,
  CONFIG_CACHE_FILE,
  INPUTS_CACHE_FILE,
  PREV_HASHES_CACHE_FILE,
  RENDERERS_CACHE_FILE,
  RENDERERS_TEMP_CACHE_DIR,
  SEED_CACHE_FILE,
} from "./cache.constants";

type HashType = {
  curr: string;
  prev: string;
};

export default class CacheManager {
  public seed!: string;
  public hashes: { [key: string]: HashType };

  constructor(private cachePath: string) {
    this.hashes = {
      inputs: {
        curr: this.generateCacheFileOrFolderHash(INPUTS_CACHE_FILE),
        prev: "",
      },
      generators: {
        curr: this.generateCacheFileOrFolderHash(GENERATORS_CACHE_FILE),
        prev: "",
      },
      renderers: {
        curr: this.generateCacheFileOrFolderHash(RENDERERS_CACHE_FILE),
        prev: "",
      },
      renderers_temp: {
        curr: this.generateCacheFileOrFolderHash(RENDERERS_TEMP_CACHE_DIR),
        prev: "",
      },
    };
    this.loadCacheHashes();
  }

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

  private loadCacheHashes(): void {
    let prevCachePath = this.getCachePath(PREV_HASHES_CACHE_FILE);
    if (fs.existsSync(prevCachePath)) {
      const prevHashes = JSON.parse(fs.readFileSync(prevCachePath).toString());
      this.hashes.inputs.prev = prevHashes.inputs?.curr;
      this.hashes.generators.prev = prevHashes.generators?.curr;
      this.hashes.renderers.prev = prevHashes.renderers?.curr;
      this.hashes.renderers_temp.prev = prevHashes.renderers_temp?.curr;
    }
  }

  public syncCacheHashes(): void {
    for (const key in this.hashes) {
      this.hashes[key].prev = this.hashes[key].curr;
    }
  }

  public generateCacheFileOrFolderHash(relativePath: string): string {
    let fileOrFolderPath = path.join(this.cachePath, relativePath);
    return this.computeFileOrFolderHash(fileOrFolderPath);
  }

  public getCachePath(relativePath: string): string {
    return path.join(this.cachePath, relativePath);
  }

  public updateCurrCacheHashAtKey(key: string, hash: string) {
    this.hashes[key].curr = hash;
  }

  public saveDataToCacheFile(relativePath: string, data: any): void {
    fs.writeFileSync(
      this.getCachePath(relativePath),
      JSON.stringify(data, null, 2)
    );
  }

  public computeDataHash(data: any): string {
    const hash = crypto.createHash("sha256");
    hash.update(JSON.stringify(data));
    return hash.digest("hex");
  }

  private computeFileHash(filePath: string): string {
    const fileData = fs.readFileSync(filePath);
    const hash = crypto.createHash("sha256");
    hash.update(fileData);
    return hash.digest("hex");
  }

  private computeFileOrFolderHash(folderPath: string): string {
    const hash = crypto.createHash("sha256");

    const computeHash = (filePath: string) => {
      if (!fs.existsSync(filePath)) {
        return "no cache";
      }
      const stats = fs.statSync(filePath);

      if (stats.isFile()) {
        const fileHash = this.computeFileHash(filePath);
        hash.update(fileHash);
      } else if (stats.isDirectory()) {
        const files = fs.readdirSync(filePath);
        files.forEach((file) => {
          const nestedFilePath = path.join(filePath, file);
          computeHash(nestedFilePath);
        });
      }
    };

    computeHash(folderPath);
    return hash.digest("hex");
  }

  public getDataFromCache(relativePath: string): any {
    let cachePath = this.getCachePath(relativePath);
    if (fs.existsSync(cachePath)) {
      return JSON.parse(fs.readFileSync(cachePath).toString());
    }
  }
}
