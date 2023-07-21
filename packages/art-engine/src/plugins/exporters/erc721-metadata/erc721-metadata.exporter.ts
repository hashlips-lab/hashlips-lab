import * as fs from "fs";
import * as path from "path";
import ItemsDataManager from "../../../utils/managers/items-data/items-data.manager";
import ExporterInterface, {
  ExporterInitPropsInterface,
} from "../../../common/exporters/exporter.interface";
import { ITEM_ATTRIBUTES_RENDERER_INTERFACE_V1 } from "../../../common/renderers/item-attributes-renderer.interface";
import { MetadataInterface } from "./erc721-metadata.interface";

export class Erc721MetadataExporter implements ExporterInterface {
  private rendersGetter!: ItemsDataManager["getRenders"];
  private outputPath!: string;
  private metadataFolder: string;
  private metadataPath!: string;
  private imageUriPrefix: string;
  private shouldSkip: boolean;

  constructor(
    constructorProps: {
      metadataFolder?: string;
      imageUriPrefix?: string;
      skip?: boolean;
    } = {}
  ) {
    this.metadataFolder = constructorProps.metadataFolder ?? "erc721 metadata";
    this.imageUriPrefix =
      constructorProps.imageUriPrefix ?? "IMAGE_URI_PREFIX_";
    this.shouldSkip = constructorProps.skip ?? false;
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

      let metadata: MetadataInterface = {
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
        JSON.stringify(metadata, null, 2)
      );
    }
  }

  public skip() {
    return this.shouldSkip;
  }
}
