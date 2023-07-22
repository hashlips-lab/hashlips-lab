import InputInterface from "./src/common/inputs/input.interface";
import GeneratorInterface from "./src/common/generators/generator.interface";
import RendererInterface from "./src/common/renderers/renderer.interface";
import ExporterInterface from "./src/common/exporters/exporter.interface";
import InputsManager from "./src/utils/managers/inputs/inputs.manager";
import ItemsDataManager from "./src/utils/managers/items-data/items-data.manager";
import PerformanceLogger from "./src/utils/loggers/performance/performance.logger";
import HeroLogger from "./src/utils/loggers/hero/hero.logger";
import PackageJson from "./package.json";
import CacheManager from "./src/utils/managers/cache/cache.manager";

import {
  CONFIG_CACHE_FILE,
  GENERATORS_CACHE_FILE,
  INPUTS_CACHE_FILE,
  PREV_HASHES_CACHE_FILE,
  RENDERERS_CACHE_FILE,
  RENDERERS_TEMP_CACHE_DIR,
} from "./src/utils/managers/cache/cache.constants";

PerformanceLogger.enable();
HeroLogger.enable();

type Config = {
  inputs: { [key: string]: InputInterface<any> };
  generators: GeneratorInterface<any>[];
  renderers: RendererInterface<any>[];
  exporters: ExporterInterface[];
  cachePath: string;
  outputPath: string;
  useCache: boolean;
};

export default class ArtEngine {
  private config: Config;
  private cacheManager: CacheManager;
  private inputsManager: InputsManager;
  private itemsDataManager: ItemsDataManager;
  private prevConfig: Config;
  private currConfig: Config;

  constructor(config: Config) {
    this.config = { ...config };
    this.inputsManager = new InputsManager();
    this.itemsDataManager = new ItemsDataManager();
    this.cacheManager = new CacheManager(this.config.cachePath);

    HeroLogger.printHero(PackageJson.version);

    this.cacheManager.init();

    this.prevConfig = this.cacheManager.getDataFromCache(CONFIG_CACHE_FILE);

    this.cacheManager.saveDataToCacheFile(CONFIG_CACHE_FILE, this.config);

    this.currConfig = this.cacheManager.getDataFromCache(CONFIG_CACHE_FILE);
  }

  private async load() {
    const timerUid = PerformanceLogger.trackTask("Loading inputs");
    const cachedData = this.cacheManager.getDataFromCache(INPUTS_CACHE_FILE);

    const cacheHashes = this.cacheManager.hashes;

    for (const key in this.config.inputs) {
      const input = this.config.inputs[key];

      if (
        this.config.useCache &&
        cachedData &&
        this.cacheManager.computeDataHash(this.currConfig?.inputs) ===
          this.cacheManager.computeDataHash(this.prevConfig?.inputs) &&
        cacheHashes.inputs.curr === cacheHashes.inputs.prev
      ) {
        console.log("Loading from cache...");
        this.inputsManager.set(key, cachedData[key]);
      } else {
        console.log("Loading...");
        await input.init({ seed: this.cacheManager.seed });
        this.inputsManager.set(key, await input.load());
      }
    }

    const frozenInputsData = this.inputsManager.freeze();

    this.cacheManager.saveDataToCacheFile(INPUTS_CACHE_FILE, frozenInputsData);

    const currInputHash =
      this.cacheManager.generateCacheFileOrFolderHash(INPUTS_CACHE_FILE);

    this.cacheManager.updateCurrCacheHashAtKey("inputs", currInputHash);

    PerformanceLogger.endTask(timerUid);
  }

  private async generate() {
    const timerUid = PerformanceLogger.trackTask("Generating");
    const cachedData = this.cacheManager.getDataFromCache(
      GENERATORS_CACHE_FILE
    );

    const cacheHashes = this.cacheManager.hashes;

    for (const generator of this.config.generators) {
      if (
        this.config.useCache &&
        cachedData &&
        this.cacheManager.computeDataHash(this.currConfig?.generators) ===
          this.cacheManager.computeDataHash(this.prevConfig?.generators) &&
        cacheHashes.inputs.curr === cacheHashes.inputs.prev &&
        cacheHashes.generators.curr === cacheHashes.generators.prev
      ) {
        console.log("Generating from cache...");
        this.itemsDataManager.addManyAttributes(cachedData);
      } else {
        console.log("Generating...");
        await generator.init({
          seed: this.cacheManager.seed,
          inputsManager: this.inputsManager,
        });

        const itemsAttributes = await generator.generate();

        for (const itemUid in itemsAttributes) {
          this.itemsDataManager.addAttributes(
            itemUid,
            itemsAttributes[itemUid]
          );
        }
      }
    }

    const frozenAttributesData = this.itemsDataManager.freezeAttributes();

    this.cacheManager.saveDataToCacheFile(
      GENERATORS_CACHE_FILE,
      frozenAttributesData
    );

    const currHash = this.cacheManager.generateCacheFileOrFolderHash(
      GENERATORS_CACHE_FILE
    );

    this.cacheManager.updateCurrCacheHashAtKey("generators", currHash);

    PerformanceLogger.endTask(timerUid);
  }

  private async render() {
    const timerUid = PerformanceLogger.trackTask("Rendering");
    const cachedData = this.cacheManager.getDataFromCache(RENDERERS_CACHE_FILE);

    const cacheHashes = this.cacheManager.hashes;

    for (const renderer of this.config.renderers) {
      if (
        this.config.useCache &&
        cachedData &&
        this.cacheManager.computeDataHash(this.currConfig?.renderers) ===
          this.cacheManager.computeDataHash(this.prevConfig?.renderers) &&
        cacheHashes.generators.curr === cacheHashes.generators.prev &&
        cacheHashes.renderers.curr === cacheHashes.renderers.prev &&
        cacheHashes.renderers_temp.curr === cacheHashes.renderers_temp.prev
      ) {
        console.log("Rendering from cache...");
        this.itemsDataManager.addManyRenders(cachedData);
      } else {
        console.log("Rendering...");
        await renderer.init({
          seed: this.cacheManager.seed,
          cachePath: this.config.cachePath,
          attributesGetter: () => this.itemsDataManager.getAttributes(),
        });

        const itemsRenders = await renderer.render();

        for (const itemUid in itemsRenders) {
          this.itemsDataManager.addRenders(itemUid, itemsRenders[itemUid]);
        }
      }
    }

    const frozenRendersData = this.itemsDataManager.freezeRenders();

    this.cacheManager.saveDataToCacheFile(
      RENDERERS_CACHE_FILE,
      frozenRendersData
    );

    const currHash =
      this.cacheManager.generateCacheFileOrFolderHash(RENDERERS_CACHE_FILE);

    const currTempHash = this.cacheManager.generateCacheFileOrFolderHash(
      RENDERERS_TEMP_CACHE_DIR
    );

    this.cacheManager.updateCurrCacheHashAtKey("renderers", currHash);
    this.cacheManager.updateCurrCacheHashAtKey("renderers_temp", currTempHash);

    PerformanceLogger.endTask(timerUid);
  }

  private async export() {
    const timerUid = PerformanceLogger.trackTask("Exporting");

    for (const exporter of this.config.exporters) {
      if (!exporter.skip()) {
        console.log("Exporting...");
        await exporter.init({
          seed: this.cacheManager.seed,
          outputPath: this.config.outputPath,
          rendersGetter: () => this.itemsDataManager.getRenders(),
        });

        await exporter.export();
      } else {
        console.log("Export skipped");
      }
    }

    PerformanceLogger.endTask(timerUid);
  }

  public async run(): Promise<void> {
    await this.load();
    await this.generate();
    await this.render();
    await this.export();

    this.cacheManager.syncCacheHashes();
    this.cacheManager.saveDataToCacheFile(
      PREV_HASHES_CACHE_FILE,
      this.cacheManager.hashes
    );
    console.log("Done");
  }

  public printPerformance() {
    PerformanceLogger.printRecap();
    PerformanceLogger.printIncompleteTasks();
  }
}
