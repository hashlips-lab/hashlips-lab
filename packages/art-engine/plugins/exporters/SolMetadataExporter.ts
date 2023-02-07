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
  symbol: string;
  seller_fee_basis_points: number;
  generator: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
  collection: {
    name: string;
    family: string;
  };
  creators: {
    address: string;
    share: number;
  }[];
}

export class SolMetadataExporter implements ExporterInterface {
  private rendersGetter!: ItemsDataManager["getRenders"];
  private outputPath!: string;
  private metadataFolder: string;
  private metadataPath!: string;
  private symbol: string;
  private sellerFeeBasisPoints: number;
  private collectionName: string;
  private collectionFamily: string;
  private imageUriPrefix: string;
  private creators: {
    address: string;
    share: number;
  }[];

  constructor(
    constructorProps: {
      metadataFolder?: string;
      symbol?: string;
      sellerFeeBasisPoints?: number;
      collectionName?: string;
      collectionFamily?: string;
      imageUriPrefix?: string;
      creators?: {
        address: string;
        share: number;
      }[];
    } = {}
  ) {
    this.metadataFolder = constructorProps.metadataFolder ?? "sol metadata";
    this.symbol = constructorProps.symbol ?? "";
    this.sellerFeeBasisPoints = constructorProps.sellerFeeBasisPoints ?? 0;
    this.collectionName = constructorProps.collectionName ?? "";
    this.collectionFamily = constructorProps.collectionFamily ?? "";
    this.creators = constructorProps.creators ?? [];
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
        symbol: this.symbol,
        seller_fee_basis_points: this.sellerFeeBasisPoints,
        generator: "HashLips Lab AE 2.0",
        attributes: normalizedAttributes,
        collection: {
          name: this.collectionName,
          family: this.collectionFamily,
        },
        creators: this.creators,
      };

      fs.writeFile(
        path.join(this.metadataPath, `${itemUid}.json`),
        JSON.stringify(metadata, null, 2),
        (err) => {
          if (err) {
            console.error(err);
            return;
          }
        }
      );
    }
  }
}
