import * as fs from "fs";
import * as path from "path";
import InputInterface, {
  InputInitPropsInterface,
} from "../../interfaces/InputInterface";
import MetadataInputInterface from "../../interfaces/inputs/MetadataInputInterface";

export class MetadataInput implements InputInterface<MetadataInputInterface> {
  private metadataBasePath: string;
  private uid: string;

  constructor(constructorProps: { metadataBasePath: string; uid: string }) {
    this.metadataBasePath = constructorProps.metadataBasePath;
    this.uid = constructorProps.uid;
  }

  public async init(props: InputInitPropsInterface) {}

  public async load(): Promise<MetadataInputInterface> {
    const items: MetadataInputInterface = {};

    const jsonString = fs.readFileSync(this.metadataBasePath, "utf8");
    const rawMetadata = JSON.parse(jsonString);

    for (const item of rawMetadata) {
      items[item[this.uid]] = {
        name: item.name,
        description: item.description,
        uid: item[this.uid],
        attributes: item.attributes,
      };
    }

    return items;
  }
}
