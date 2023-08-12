// Art Engine
import ArtEngine from "../src/art-engine";
// Inputs
import { ImageLayersInput } from "../src/plugins/inputs/image-layers";
// Generators
import { ImageLayersAttributesGenerator } from "../src/plugins/generators/image-layers-attributes";
// Renderers
import { ImageLayersRenderer } from "../src/plugins/renderers/image-layers";
import { ItemAttributesRenderer } from "../src/plugins/renderers/item-attributes";
// Exporters
import { ImagesExporter } from "../src/plugins/exporters/images";
import { Erc721MetadataExporter } from "../src/plugins/exporters/erc721-metadata";
import { SolMetadataExporter } from "../src/plugins/exporters/sol-metadata";
// Processors
import { SharpImageProcessor } from "../src/utils/processors/sharp";

const BASE_PATH = __dirname;

test("ArtEngine", async () => {
  const ae = new ArtEngine({
    cachePath: `${BASE_PATH}/data/cache`,
    outputPath: `${BASE_PATH}/data/output`,
    useCache: false,
    inputs: {
      apes: new ImageLayersInput({
        assetsBasePath: `${BASE_PATH}/data/layers`,
      }),
    },
    generators: [
      new ImageLayersAttributesGenerator({
        dataSet: "apes",
        startIndex: 1,
        endIndex: 2,
      }),
    ],
    renderers: [
      new ItemAttributesRenderer({
        name: (itemUid) => `Ape ${itemUid}`,
        description: (attributes) => {
          return `This is a token with ${attributes["Background"][0]} as a Background`;
        },
      }),
      new ImageLayersRenderer({
        width: 2048,
        height: 2048,
        imageProcessor: new SharpImageProcessor(),
      }),
    ],
    exporters: [
      new ImagesExporter(),
      new Erc721MetadataExporter({
        imageUriPrefix: "ipfs://Update/",
      }),
      new SolMetadataExporter({
        imageUriPrefix: "ipfs://CID/",
        symbol: "APES",
        sellerFeeBasisPoints: 200,
        collectionName: "The Apes",
        creators: [
          {
            address: "xEtQ9Fpv62qdc1GYfpNReMasVTe9YW5bHJwfVKqo72u",
            share: 100,
          },
        ],
      }),
    ],
  });

  await ae.run();
  ae.printPerformance();
});
