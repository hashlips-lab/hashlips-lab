import ItemsDataManager, {
  ItemPropertiesInterface,
} from "../core/ItemsDataManager";

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
