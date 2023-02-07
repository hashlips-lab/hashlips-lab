export default interface ImageProcessorInterface {
  createImageWithLayers: (createImageWithLayers: {
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
  }) => Promise<void>;
}
