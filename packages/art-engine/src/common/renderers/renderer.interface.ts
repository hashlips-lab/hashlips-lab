import ItemsDataManager from "../../utils/managers/items-data/items-data.manager";
import { ItemPropertiesInterface } from "../../utils/managers/items-data/items-data.interface";

export interface RendererInitPropsInterface {
  seed: string;
  cachePath: string;
  attributesGetter: ItemsDataManager["getAttributes"];
}

export interface ItemsRenders<RenderDataType> {
  [itemUid: string]: ItemPropertiesInterface<RenderDataType>[];
}

export default interface RendererInterface<RendererDataType> {
  init: (props: RendererInitPropsInterface) => Promise<void>;
  render: () => Promise<ItemsRenders<RendererDataType>>;
}
