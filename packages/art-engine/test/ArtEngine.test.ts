import ArtEngine from "../ArtEngine";
import { ImageLayersInput } from "../plugins/inputs/ImageLayersInput";
import { ImageLayersAttributesGenerator } from "../plugins/generators/ImageLayersAttributesGenerator";
import { ImageLayersRenderer } from "../plugins/renderers/ImageLayersRenderer";
import { ItemAttributesRenderer } from "../plugins/renderers/ItemAttributesRenderer";
import { ImagesExporter } from "../plugins/exporters/ImagesExporter";
import { SharpImageProcessor } from "../utils/processors/SharpImageProcessor";
import { Erc721MetadataExporter } from "../plugins/exporters/Erc721MetadataExporter";
import { SolMetadataExporter } from "../plugins/exporters/SolMetadataExporter";
import { MetadataInput } from "../plugins/inputs/MetadataInput";

const BASE_PATH = __dirname;

jest.setTimeout(200000);

test("ArtEngine", async () => {
  const ae = new ArtEngine({
    cachePath: `${BASE_PATH}/data/cache`,
    outputPath: `${BASE_PATH}/data/output`,
    inputs: {
      apes: new ImageLayersInput({
        assetsBasePath: `${BASE_PATH}/data/mutant layers`,
      }),
      metadata: new MetadataInput({
        metadataBasePath: `${BASE_PATH}/data/metadata/_metadata_test.json`,
        uid: "edition",
      }),
    },
    generators: [
      new ImageLayersAttributesGenerator({
        dataSet: "apes",
        metadataSet: "metadata",
        startIndex: 1,
        endIndex: 2,
      }),
    ],
    renderers: [
      new ItemAttributesRenderer({
        name: (itemUid) => `Ape ${itemUid}`,
        description: (attributes) => {
          return `This is a token with as a Background`;
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
        imageUriPrefix: "ipfs://CID/",
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
  // ae.printPerformance();
});
