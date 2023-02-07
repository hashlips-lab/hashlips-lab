import InputsManager from "../core/InputsManager";
import { ItemPropertiesInterface } from "../core/ItemsDataManager";

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
