import * as fs from "fs";
import * as path from "path";
import ItemsDataManager from "../../core/ItemsDataManager";
import ExporterInterface, {
  ExporterInitPropsInterface,
} from "../../interfaces/ExporterInterface";
import { ITEM_ATTRIBUTES_RENDERER_INTERFACE_V1 } from "../../interfaces/renderers/ItemAttributesRendererInterface";
import { STATIC_LAYERED_IMAGES_RENDERER_INTERFACE_V1 } from "../../interfaces/renderers/StaticLayeredImagesRendererInterface";

export class ImagesExporter implements ExporterInterface {
  private rendersGetter!: ItemsDataManager["getRenders"];
  private outputPath!: string;
  private imagesFolder: string;
  private imagesPath!: string;

  constructor(
    constructorProps: {
      imagesFolder?: string;
    } = {}
  ) {
    this.imagesFolder = constructorProps.imagesFolder ?? "images";
  }

  public async init(props: ExporterInitPropsInterface) {
    this.rendersGetter = props.rendersGetter;
    this.outputPath = props.outputPath;
    this.imagesPath = path.join(this.outputPath, this.imagesFolder);
  }

  public async export(): Promise<void> {
    if (!fs.existsSync(this.outputPath)) {
      fs.mkdirSync(this.outputPath);
    }

    if (!fs.existsSync(this.imagesPath)) {
      fs.mkdirSync(this.imagesPath);
    }

    for (const [itemUid, renders] of Object.entries(this.rendersGetter())) {
      let image = renders.find(
        (render) => STATIC_LAYERED_IMAGES_RENDERER_INTERFACE_V1 === render.kind
      );

      if (!image) {
        throw new Error(`Could not find any supported image`);
      }

      let attributes = renders.find(
        (render) => ITEM_ATTRIBUTES_RENDERER_INTERFACE_V1 === render.kind
      );

      if (!attributes) {
        throw new Error(`Could not find any supported attributes`);
      }

      fs.copyFileSync(
        image?.data.path,
        path.join(this.imagesPath, `${attributes?.data.dna[0]}.png`),
      );
    }
  }
}
