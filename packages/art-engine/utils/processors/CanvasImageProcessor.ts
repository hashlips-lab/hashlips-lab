import ImageProcessorInterface from "../../interfaces/renderers/ImageProcessorInterface";
import Canvas, { loadImage } from "canvas";
import * as fs from "fs";

export class CanvasImageProcessor implements ImageProcessorInterface {
  private cachedAssets!: { [key: string]: any };

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
    let canvas = Canvas.createCanvas(
      createImageWithLayersProps.width,
      createImageWithLayersProps.height
    );
    const ctx = canvas.getContext("2d");

    for (let asset of createImageWithLayersProps.assets) {
      if (!this.cachedAssets[asset.path]) {
        this.cachedAssets[asset.path] = await loadImage(asset.path);
      }

      ctx.drawImage(
        this.cachedAssets[asset.path],
        asset.xOffset,
        asset.yOffset
      );
    }

    fs.writeFileSync(
      createImageWithLayersProps.outputPath,
      canvas.toBuffer("image/png")
    );
  }
}
