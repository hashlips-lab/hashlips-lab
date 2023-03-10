import ImageProcessorInterface from "../../interfaces/renderers/ImageProcessorInterface";
import sharp from "sharp";

interface SharpCompositeLayer {
  input: string;
  left: number;
  top: number;
}

export class SharpImageProcessor implements ImageProcessorInterface {
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
    let normalizedAssets: SharpCompositeLayer[] = createImageWithLayersProps.assets.map(asset => ({
      input: asset.path,
      left: asset.xOffset,
      top: asset.yOffset,
    }));

    await sharp({
      create: {
        width: createImageWithLayersProps.width,
        height: createImageWithLayersProps.height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite(normalizedAssets)
      .toFile(createImageWithLayersProps.outputPath);
  }
}
