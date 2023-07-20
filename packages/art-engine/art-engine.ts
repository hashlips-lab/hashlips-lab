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
  ATTRIBUTES_CACHE_FILE,
  CONFIG_CACHE_FILE,
  INPUTS_CACHE_FILE,
  RENDERS_CACHE_FILE,
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
};

export default class ArtEngine {
  private config: Config;
  private cacheManager: CacheManager;
  private inputsManager: InputsManager;
  private itemsDataManager: ItemsDataManager;

  constructor(config: Config) {
    this.config = config;
    this.inputsManager = new InputsManager();
    this.itemsDataManager = new ItemsDataManager();
    this.cacheManager = new CacheManager(this.config.cachePath);

    this.cacheManager.init();
    HeroLogger.printHero(PackageJson.version);
  }

  private async load() {
    const timerUid = PerformanceLogger.trackTask("Loading inputs");
    this.cacheManager.saveDataToCache(CONFIG_CACHE_FILE, this.config);

    for (const key in this.config.inputs) {
      const input = this.config.inputs[key];

      await input.init({ seed: this.cacheManager.seed });
      this.inputsManager.set(key, await input.load());
    }

    const frozenInputsData = this.inputsManager.freeze();

    this.cacheManager.saveDataToCache(INPUTS_CACHE_FILE, frozenInputsData);

    PerformanceLogger.endTask(timerUid);
  }

  private async generate() {
    const timerUid = PerformanceLogger.trackTask("Generating");

    for (const generator of this.config.generators) {
      await generator.init({
        seed: this.cacheManager.seed,
        inputsManager: this.inputsManager,
      });

      const itemsAttributes = await generator.generate();

      for (const itemUid in itemsAttributes) {
        this.itemsDataManager.addAttributes(itemUid, itemsAttributes[itemUid]);
      }
    }

    const frozenAttributesData = this.itemsDataManager.freezeAttributes();

    this.cacheManager.saveDataToCache(
      ATTRIBUTES_CACHE_FILE,
      frozenAttributesData
    );

    PerformanceLogger.endTask(timerUid);
  }

  private async render() {
    const timerUid = PerformanceLogger.trackTask("Rendering");

    for (const renderer of this.config.renderers) {
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

    const frozenRendersData = this.itemsDataManager.freezeRenders();

    this.cacheManager.saveDataToCache(RENDERS_CACHE_FILE, frozenRendersData);

    PerformanceLogger.endTask(timerUid);
  }

  private async export() {
    const timerUid = PerformanceLogger.trackTask("Exporting");

    for (const exporter of this.config.exporters) {
      await exporter.init({
        seed: this.cacheManager.seed,
        outputPath: this.config.outputPath,
        rendersGetter: () => this.itemsDataManager.getRenders(),
      });

      await exporter.export();
    }
    PerformanceLogger.endTask(timerUid);
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
    PerformanceLogger.printRecap();
    PerformanceLogger.printIncompleteTasks();
  }
}
