export const ITEM_ATTRIBUTES_RENDERER_INTERFACE_V1 =
  "ItemAttributesRendererInterface@v1";

export default interface ItemAttributesRendererInterface {
  dna: string[];
  name: string;
  description: string;
  attributes: {
    [traitName: string]: string[];
  };
}
