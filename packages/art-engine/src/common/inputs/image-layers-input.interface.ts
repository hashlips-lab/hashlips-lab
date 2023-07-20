interface LayerAsset {
  path: string;
  size: number;
  relativeXOffset: number;
  relativeYOffset: number;
  relativeZOffset: number;
  lastModifiedTime: number;
}

export default interface ImageLayersInputInterface {
  basePath: string;
  layers: {
    [traitName: string]: {
      name: string;
      baseXOffset: number;
      baseYOffset: number;
      baseZOffset: number;
      options: {
        [optionName: string]: {
          name: string;
          weight: number;
          assets: LayerAsset[];
          edgeCases: {
            [matchUid: string]: {
              matchingTrait: string;
              matchingValue: string;
              assets: LayerAsset[];
            };
          };
        };
      };
    };
  };
}
