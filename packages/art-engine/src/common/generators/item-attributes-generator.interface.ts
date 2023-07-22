export const ITEM_ATTRIBUTES_GENERATOR_INTERFACE_V1 =
  "ItemAttributesGeneratorInterface@v1";

export default interface ItemAttributesGeneratorInterface {
  dna: string;
  attributes: {
    [traitName: string]: string;
  };
}
