import InputsManager from "../../utils/managers/inputs/inputs.manager";
import { ItemPropertiesInterface } from "../../utils/managers/items-data/items-data.interface";

export interface GeneratorInitPropsInterface {
  seed: string;
  inputsManager: InputsManager;
}

export interface ItemsAttributes<AttributeDataType> {
  [itemUid: string]: ItemPropertiesInterface<AttributeDataType>[];
}

export default interface GeneratorInterface<GeneratorDataType> {
  init: (props: GeneratorInitPropsInterface) => Promise<void>;
  generate: () => Promise<ItemsAttributes<GeneratorDataType>>;
}
