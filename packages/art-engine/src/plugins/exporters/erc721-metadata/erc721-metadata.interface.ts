export interface MetadataInterface {
  description: string;
  image: string;
  name: string;
  dna: string;
  uid: string;
  generator: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
}
