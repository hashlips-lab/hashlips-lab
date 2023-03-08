import * as fs from "fs";
import * as path from "path";
import ItemsDataManager from "../../core/ItemsDataManager";
import ExporterInterface, {
  ExporterInitPropsInterface,
} from "../../interfaces/ExporterInterface";
import { ITEM_ATTRIBUTES_RENDERER_INTERFACE_V1 } from "../../interfaces/renderers/ItemAttributesRendererInterface";

interface Metadata {
  description: string;
  image: string;
  name: string;
  dna: string;
  uid: string;
  generator: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
}

export class Erc721MetadataExporter implements ExporterInterface {
  private rendersGetter!: ItemsDataManager["getRenders"];
  private outputPath!: string;
  private metadataFolder: string;
  private metadataPath!: string;
  private imageUriPrefix: string;

  constructor(
    constructorProps: {
      metadataFolder?: string;
      imageUriPrefix?: string;
    } = {}
  ) {
    this.metadataFolder = constructorProps.metadataFolder ?? "erc721 metadata";
    this.imageUriPrefix =
      constructorProps.imageUriPrefix ?? "IMAGE_URI_PREFIX_";
  }

  public async init(props: ExporterInitPropsInterface) {
    this.rendersGetter = props.rendersGetter;
    this.outputPath = props.outputPath;
    this.metadataPath = path.join(this.outputPath, this.metadataFolder);
  }

  public async export(): Promise<void> {
    if (!fs.existsSync(this.outputPath)) {
      fs.mkdirSync(this.outputPath);
    }

    if (!fs.existsSync(this.metadataPath)) {
      fs.mkdirSync(this.metadataPath);
    }

    for (const [itemUid, renders] of Object.entries(this.rendersGetter())) {
      let attributes = renders.find(
        (render) => ITEM_ATTRIBUTES_RENDERER_INTERFACE_V1 === render.kind
      );

      if (!attributes) {
        throw new Error(`Could not find any supported attributes`);
      }

      let normalizedAttributes: { trait_type: string; value: string }[] = [];

      for (const [attributeKey, attributeValues] of Object.entries(
        attributes?.data.attributes
      )) {
        let attributeValuesArr = attributeValues as string[];

        normalizedAttributes.push({
          trait_type: attributeKey,
          value: attributeValuesArr[0],
        });
      }

      let metadata: Metadata = {
        description: attributes?.data.description,
        image: `${this.imageUriPrefix}${attributes?.data.dna[0]}.png`,
        name: attributes?.data.name,
        dna: attributes?.data.dna[0],
        uid: itemUid,
        generator: "HashLips Lab AE 2.0",
        attributes: normalizedAttributes,
      };

      fs.writeFileSync(
        path.join(this.metadataPath, `${itemUid}.json`),
        JSON.stringify(metadata, null, 2),
      );
    }
  }
}
