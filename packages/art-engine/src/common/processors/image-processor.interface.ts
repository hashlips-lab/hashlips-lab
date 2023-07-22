export default interface ImageProcessorInterface {
  createImageWithLayers: (createImageWithLayers: {
    width: number;
    height: number;
    outputPath: string;
    assets: {
      path: string;
      xOffset: number;
      yOffset: number;
      zOffset: number;
    }[];
  }) => Promise<void>;
}
