export interface MetadataInterface {
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
