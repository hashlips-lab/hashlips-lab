import ItemsDataManager from "../../utils/managers/items-data/items-data.manager";

export interface ExporterInitPropsInterface {
  seed: string;
  outputPath: string;
  rendersGetter: ItemsDataManager["getRenders"];
}

export default interface ExporterInterface {
  init: (props: ExporterInitPropsInterface) => Promise<void>;
  export: () => Promise<void>;
  skip: () => boolean;
}
