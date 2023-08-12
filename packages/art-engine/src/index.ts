export { default as ArtEngine } from "./art-engine";

import { ImageLayersInput } from "./plugins/inputs/image-layers";

export const inputs = {
  ImageLayersInput,
};

import { ImageLayersAttributesGenerator } from "./plugins/generators/image-layers-attributes";

export const generators = {
  ImageLayersAttributesGenerator,
};

import { ItemAttributesRenderer } from "./plugins/renderers/item-attributes";
import { ImageLayersRenderer } from "./plugins/renderers/image-layers";

export const renderers = {
  ItemAttributesRenderer,
  ImageLayersRenderer,
};

import { ImagesExporter } from "./plugins/exporters/images";
import { Erc721MetadataExporter } from "./plugins/exporters/erc721-metadata";
import { SolMetadataExporter } from "./plugins/exporters/sol-metadata";

export const exporters = {
  ImagesExporter,
  Erc721MetadataExporter,
  SolMetadataExporter,
};

// Managers
import InputsManager from "./utils/managers/inputs/inputs.manager";
import ItemsDataManager from "./utils/managers/items-data/items-data.manager";

export const manager = {
  InputsManager,
  ItemsDataManager,
};

// Interfaces
export * from "./common/inputs/input.interface";
export * from "./common/generators/generator.interface";
export * from "./common/renderers/renderer.interface";
export * from "./common/exporters/exporter.interface";

// Cache constants
export * as CACHE from "./utils/managers/cache/cache.constants";
