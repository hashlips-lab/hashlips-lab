import InputsManager from "../../../utils/managers/inputs/inputs.manager";
import GeneratorInterface, {
  GeneratorInitPropsInterface,
  ItemsAttributes,
} from "../../../common/generators/generator.interface";
import ImageLayersInputInterface from "../../../common/inputs/image-layers-input.interface";
import * as path from "path";
import crypto from "crypto";
import ImageLayersGeneratorInterface, {
  IMAGE_LAYERS_GENERATOR_INTERFACE_V1,
} from "../../../common/generators/image-layers-generator.interface";
import AttributesGeneratorInterface, {
  ITEM_ATTRIBUTES_GENERATOR_INTERFACE_V1,
} from "../../../common/generators/item-attributes-generator.interface";
import { EDGE_CASE_UID_SEPARATOR } from "../../inputs/image-layers";
import RandomSeed from "random-seed";

type Options = ImageLayersInputInterface["layers"][string]["options"];
type GeneratorOutput =
  | ImageLayersGeneratorInterface
  | AttributesGeneratorInterface;

export class ImageLayersAttributesGenerator
  implements GeneratorInterface<GeneratorOutput>
{
  private inputsManager!: InputsManager;
  private dataSet!: string;
  private data!: ImageLayersInputInterface;
  private startIndex: number;
  private endIndex: number;
  private rmg!: RandomSeed.RandomSeed;

  constructor(constructorProps: {
    dataSet: string;
    startIndex: number;
    endIndex: number;
  }) {
    this.dataSet = constructorProps.dataSet;
    this.startIndex = constructorProps.startIndex;
    this.endIndex = constructorProps.endIndex;

    if (
      this.endIndex < this.startIndex ||
      this.startIndex + this.endIndex < 1
    ) {
      throw new Error(
        `The startIndex property needs to be less than the endIndex property`
      );
    }
  }

  public async init(props: GeneratorInitPropsInterface) {
    this.inputsManager = props.inputsManager;
    this.data = this.inputsManager.get(this.dataSet);

    this.rmg = RandomSeed.create(
      this.dataSet + this.constructor.name + props.seed
    );
    // TODO: add support for "kind"
  }

  public async generate(): Promise<ItemsAttributes<GeneratorOutput>> {
    const items: ItemsAttributes<GeneratorOutput> = {};
    const dnas = new Set<string>();

    let uid = this.startIndex;
    while (uid <= this.endIndex) {
      const itemAttributes: AttributesGeneratorInterface["attributes"] = {};
      let itemAssets: ImageLayersGeneratorInterface["assets"] = [];

      // Compute attributes
      for (let layer of Object.values(this.data.layers)) {
        itemAttributes[layer.name] = this.selectRandomItemByWeight(
          layer.options
        );
      }

      // Compute DNA
      const itemDna: AttributesGeneratorInterface["dna"] =
        this.calculateDna(itemAttributes);

      if (dnas.has(itemDna)) {
        console.log(`Duplicate DNA entry, generating one more...`);

        continue;
      }

      dnas.add(itemDna);

      // Compute assets
      for (const attributeName of Object.keys(itemAttributes)) {
        const layer = this.data.layers[attributeName];
        const option = layer.options[itemAttributes[attributeName]];
        let assets: ImageLayersInputInterface["layers"][string]["options"][string]["assets"][number][] =
          [];

        for (const edgeCaseUid of Object.keys(option.edgeCases)) {
          const [matchingTrait, matchingValue] = edgeCaseUid.split(
            EDGE_CASE_UID_SEPARATOR
          );

          if (matchingValue === itemAttributes[matchingTrait]) {
            assets = assets.concat(option.edgeCases[edgeCaseUid].assets);

            break;
          }
        }

        if (assets.length === 0) {
          assets = assets.concat(option.assets);
        }

        itemAssets = itemAssets.concat(
          assets.map((asset) => ({
            path: path.join(this.data.basePath, asset.path),
            xOffset: layer.baseXOffset + asset.relativeXOffset,
            yOffset: layer.baseYOffset + asset.relativeYOffset,
            zOffset: layer.baseZOffset + asset.relativeZOffset,
          }))
        );
      }

      items[uid.toString()] = [
        {
          kind: ITEM_ATTRIBUTES_GENERATOR_INTERFACE_V1,
          data: {
            dna: itemDna,
            attributes: itemAttributes,
          },
        },
        {
          kind: IMAGE_LAYERS_GENERATOR_INTERFACE_V1,
          data: {
            assets: itemAssets,
          },
        },
      ];

      uid++;
    }

    return items;
  }

  private calculateDna(
    attributes: AttributesGeneratorInterface["attributes"]
  ): string {
    const dnaSource = Object.keys(attributes)
      .map((key) => [key, attributes[key]])
      .sort((a, b) => {
        const nameA = a[0].toUpperCase();
        const nameB = b[0].toUpperCase();

        if (nameA < nameB) {
          return -1;
        }

        if (nameA > nameB) {
          return 1;
        }

        return 0;
      });

    return crypto
      .createHash("sha1")
      .update(JSON.stringify(dnaSource))
      .digest("hex");
  }

  private selectRandomItemByWeight(options: Options): string {
    const totalWeight = Object.values(options).reduce(
      (accumulator, currentValue) => accumulator + currentValue.weight,
      0
    );

    let randomNumber = this.rmg.random() * totalWeight;

    for (const key of Object.keys(options)) {
      if (randomNumber < options[key].weight) {
        return key;
      }

      randomNumber -= options[key].weight;
    }

    throw new Error("Couldn't pick any random option...");
  }
}
