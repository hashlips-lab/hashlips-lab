import RendererInterface, {
  ItemsRenders,
  RendererInitPropsInterface,
} from "../../../common/renderers/renderer.interface";
import StaticLayeredImagesRendererInterface, {
  STATIC_LAYERED_IMAGES_RENDERER_INTERFACE_V1,
} from "../../../common/renderers/static-layered-images-renderer.interface";
import ItemsDataManager from "../../../utils/managers/items-data/items-data.manager";
import ImageLayersGeneratorInterface, {
  IMAGE_LAYERS_GENERATOR_INTERFACE_V1,
} from "../../../common/generators/image-layers-generator-interface";
import * as path from "path";
import * as fs from "fs";
import ImageProcessorInterface from "../../../common/processors/image-processor.interface";
import PerformanceTracker from "../../../utils/loggers/performance/performance.logger";
import { SharpImageProcessor } from "../../../utils/processors/sharp/sharp-image.processor";
import { RENDERERS_TEMP_CACHE_DIR } from "../../../utils/managers/cache/cache.constants";

export class ImageLayersRenderer
  implements RendererInterface<StaticLayeredImagesRendererInterface>
{
  private attributesGetter!: ItemsDataManager["getAttributes"];
  private tempRenderDir!: string;
  private imageProcessor!: ImageProcessorInterface;
  private width!: number;
  private height!: number;

  constructor(constructorProps: {
    width: number;
    height: number;
    imageProcessor?: ImageProcessorInterface;
  }) {
    this.width = constructorProps.width;
    this.height = constructorProps.height;
    this.imageProcessor =
      constructorProps.imageProcessor ?? new SharpImageProcessor();
  }

  public async init(props: RendererInitPropsInterface) {
    this.attributesGetter = props.attributesGetter;
    this.tempRenderDir = path.join(props.cachePath, RENDERERS_TEMP_CACHE_DIR);
  }

  public async render(): Promise<
    ItemsRenders<StaticLayeredImagesRendererInterface>
  > {
    const renders: ItemsRenders<StaticLayeredImagesRendererInterface> = {};

    for (const [itemUid, attributes] of Object.entries(
      this.attributesGetter()
    )) {
      const timerUid = PerformanceTracker.trackTask(
        "Image render",
        `Item ${itemUid}`
      );
      if (!fs.existsSync(this.tempRenderDir)) {
        fs.mkdirSync(this.tempRenderDir);
      }

      const supportedAssets: ImageLayersGeneratorInterface["assets"] =
        attributes
          .filter(
            (attribute) =>
              IMAGE_LAYERS_GENERATOR_INTERFACE_V1 === attribute.kind
          )
          .reduce(
            (mergedAttributes, newAttributes) =>
              mergedAttributes.concat(newAttributes.data.assets),
            []
          );

      if (supportedAssets.length < 1) {
        throw new Error(
          `Couldn't find any supported set of attributes for the current item: ${itemUid}`
        );
      }

      //TODO Check timestamp

      let assets = supportedAssets.sort((a, b) => a.zOffset - b.zOffset);
      const outputPath = path.join(this.tempRenderDir, `${itemUid}.png`);

      await this.imageProcessor.createImageWithLayers({
        width: this.width,
        height: this.height,
        outputPath: outputPath,
        assets: assets,
      });

      const outputStats = fs.statSync(outputPath);

      renders[itemUid] = [
        {
          kind: STATIC_LAYERED_IMAGES_RENDERER_INTERFACE_V1,
          data: {
            path: outputPath,
          },
        },
      ];

      PerformanceTracker.endTask(timerUid);
    }

    return renders;
  }
}
