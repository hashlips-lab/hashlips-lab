export default interface MetadataInputInterface {
  [uid: string]: {
    name: string;
    description: string;
    uid: number;
    attributes: { trait_type: string; value: string }[];
  };
}
