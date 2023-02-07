import ImageProcessorInterface from "../../interfaces/renderers/ImageProcessorInterface";
import Jimp from "jimp-native";

export class JimpImageProcessor implements ImageProcessorInterface {
  private cachedAssets!: { [key: string]: typeof Jimp };

  constructor() {
    this.cachedAssets = {};
  }

  public async createImageWithLayers(createImageWithLayersProps: {
    width: number;
    height: number;
    outputPath: string;
    assets: {
      path: string;
      latestModifiedTimestamp: number;
      xOffset: number;
      yOffset: number;
      zOffset: number;
    }[];
  }): Promise<void> {
    const image = new Jimp(
      createImageWithLayersProps.width,
      createImageWithLayersProps.height,
      "transparent",
      (err: any) => {
        if (err) throw err;
      }
    );

    for (let asset of createImageWithLayersProps.assets) {
      if (!this.cachedAssets[asset.path]) {
        this.cachedAssets[asset.path] = await Jimp.read(asset.path);
      }

      image.blit(this.cachedAssets[asset.path], asset.xOffset, asset.yOffset);
    }

    await image.writeAsync(createImageWithLayersProps.outputPath);
  }
}
