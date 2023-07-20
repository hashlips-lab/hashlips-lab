export const IMAGE_LAYERS_GENERATOR_INTERFACE_V1 =
  "ImageLayersGeneratorInterface@v1";

export default interface ImageLayersGeneratorInterface {
  assets: {
    path: string;
    latestModifiedTimestamp: number;
    xOffset: number;
    yOffset: number;
    zOffset: number;
  }[];
}
