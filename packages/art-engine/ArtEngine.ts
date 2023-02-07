import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import InputInterface from "./interfaces/InputInterface";
import GeneratorInterface from "./interfaces/GeneratorInterface";
import RendererInterface from "./interfaces/RendererInterface";
import ExporterInterface from "./interfaces/ExporterInterface";
import InputsManager from "./core/InputsManager";
import ItemsDataManager from "./core/ItemsDataManager";
import PerformanceTracker from "./core/PerformanceTracker";
import Logger from "./core/Logger";
import PackageJson from "./package.json";

PerformanceTracker.enable();
Logger.enable();

type Config = {
  inputs: { [key: string]: InputInterface<any> };
  generators: GeneratorInterface<any>[];
  renderers: RendererInterface<any>[];
  exporters: ExporterInterface[];
  cachePath: string;
  outputPath: string;
};

const SEED_CACHE_FILE = "seed.json";

export default class ArtEngine {
  private config: Config;
  private seed?: string;
  private inputsManager: InputsManager;
  private itemsDataManager: ItemsDataManager;

  constructor(config: Config) {
    this.config = config;
    this.inputsManager = new InputsManager();
    this.itemsDataManager = new ItemsDataManager();
    Logger.printHero(PackageJson.version);
  }

  private async load() {
    const timerUid = PerformanceTracker.trackTask("Loading inputs");
    this.initCache();

    for (const key in this.config.inputs) {
      const input = this.config.inputs[key];

      await input.init({ seed: this.seed! });
      this.inputsManager.set(key, await input.load());
    }

    this.inputsManager.freeze();

    // TODO: implement cache
    //this.cache("input.json", this.inputs);
    PerformanceTracker.endTask(timerUid);
  }

  private async generate() {
    const timerUid = PerformanceTracker.trackTask("Generating");

    for (const generator of this.config.generators) {
      await generator.init({
        seed: this.seed!,
        inputsManager: this.inputsManager,
      });

      const itemsAttributes = await generator.generate();

      for (const itemUid in itemsAttributes) {
        this.itemsDataManager.addAttributes(itemUid, itemsAttributes[itemUid]);
      }
    }

    this.itemsDataManager.freezeAttributes();
    PerformanceTracker.endTask(timerUid);
  }

  private async render() {
    const timerUid = PerformanceTracker.trackTask("Rendering");

    for (const renderer of this.config.renderers) {
      await renderer.init({
        seed: this.seed!,
        cachePath: this.config.cachePath,
        attributesGetter: () => this.itemsDataManager.getAttributes(),
      });

      const itemsRenders = await renderer.render();

      for (const itemUid in itemsRenders) {
        this.itemsDataManager.addRenders(itemUid, itemsRenders[itemUid]);
      }
    }

    this.itemsDataManager.freezeRenders();
    PerformanceTracker.endTask(timerUid);
  }

  private async export() {
    const timerUid = PerformanceTracker.trackTask("Exporting");

    for (const exporter of this.config.exporters) {
      await exporter.init({
        seed: this.seed!,
        outputPath: this.config.outputPath,
        rendersGetter: () => this.itemsDataManager.getRenders(),
      });

      await exporter.export();
    }
    PerformanceTracker.endTask(timerUid);
  }

  public async run(): Promise<void> {
    console.log("Loading data...");
    await this.load();
    console.log("Generating...");
    await this.generate();
    console.log("Rendering...");
    await this.render();
    console.log("Exporting...");
    await this.export();
    console.log("Done");
  }

  public printPerformance() {
    PerformanceTracker.printRecap();
    PerformanceTracker.printIncompleteTasks();
  }

  private initCache(): void {
    if (this.seed !== undefined) {
      return;
    }

    if (!fs.existsSync(this.config.cachePath)) {
      fs.mkdirSync(this.config.cachePath);
    }

    const seedFilePath = this.getCachePath(SEED_CACHE_FILE);
    if (fs.existsSync(seedFilePath)) {
      this.seed = JSON.parse(fs.readFileSync(seedFilePath).toString()).seed;

      return;
    }

    const newSeed = crypto.randomBytes(128).toString("hex"); // 256 random chars
    const seedFileDir = path.dirname(seedFilePath);

    fs.mkdirSync(seedFileDir, { recursive: true });
    fs.writeFileSync(seedFilePath, JSON.stringify({ seed: newSeed }, null, 2));

    this.seed = newSeed;
  }

  private getCachePath(relativePath: string): string {
    return path.join(this.config.cachePath, relativePath);
  }
}
