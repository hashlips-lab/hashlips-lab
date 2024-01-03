import ItemsDataManager from "../core/ItemsDataManager";

export interface ExporterInitPropsInterface {
  seed: string;
  outputPath: string;
  rendersGetter: ItemsDataManager["getRenders"];
  ids?: number[];
}

export default interface ExporterInterface {
  init: (props: ExporterInitPropsInterface) => Promise<void>;
  export: () => Promise<void>;
}
