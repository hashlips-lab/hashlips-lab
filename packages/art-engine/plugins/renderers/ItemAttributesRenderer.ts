import RendererInterface, {
  ItemsRenders,
  RendererInitPropsInterface,
} from "../../interfaces/RendererInterface";
import ItemsDataManager from "../../core/ItemsDataManager";
import AttributesRendererInterface, {
  ITEM_ATTRIBUTES_RENDERER_INTERFACE_V1,
} from "../../interfaces/renderers/ItemAttributesRendererInterface";
import ItemAttributesGeneratorInterface, {
  ITEM_ATTRIBUTES_GENERATOR_INTERFACE_V1,
} from "../../interfaces/generators/ItemAttributesGeneratorInterface";

export class ItemAttributesRenderer
  implements RendererInterface<AttributesRendererInterface>
{
  private attributesGetter!: ItemsDataManager["getAttributes"];
  private name!: (itemUid: string) => string;
  private description!: (
    attributes: AttributesRendererInterface["attributes"]
  ) => string;

  constructor(
    constructorProps: {
      name?: (itemUid: string) => string;
      description?: (
        attributes: AttributesRendererInterface["attributes"]
      ) => string;
    } = {}
  ) {
    this.name = constructorProps.name ? constructorProps.name : () => "";
    this.description = constructorProps.description
      ? constructorProps.description
      : () => "";
  }

  public async init(props: RendererInitPropsInterface) {
    this.attributesGetter = props.attributesGetter;
  }

  public async render(): Promise<ItemsRenders<AttributesRendererInterface>> {
    const renders: ItemsRenders<AttributesRendererInterface> = {};

    for (const [itemUid, attributes] of Object.entries(
      this.attributesGetter()
    )) {
      const supportedAttributes: ItemAttributesGeneratorInterface[] = attributes
        .filter(
          (attribute) =>
            ITEM_ATTRIBUTES_GENERATOR_INTERFACE_V1 === attribute.kind
        )
        .map((attribute) => attribute.data);

      if (supportedAttributes.length < 1) {
        throw new Error(
          `Couldn't find any supported set of attributes for the current item: ${itemUid}`
        );
      }

      renders[itemUid] = [
        supportedAttributes.reduce(
          (mergedAttributes, newAttributes) => {
            mergedAttributes.data.dna.push(newAttributes.dna);

            mergedAttributes.data.name = this.name(itemUid);

            for (const key in newAttributes.attributes) {
              if (mergedAttributes.data.attributes[key] === undefined) {
                mergedAttributes.data.attributes[key] = [];
              }

              mergedAttributes.data.attributes[key].push(
                newAttributes.attributes[key]
              );
            }
            mergedAttributes.data.description = this.description(
              mergedAttributes.data.attributes
            );
            return mergedAttributes;
          },
          {
            kind: ITEM_ATTRIBUTES_RENDERER_INTERFACE_V1,
            data: {
              dna: [],
              name: "",
              description: "",
              attributes: {},
            } as AttributesRendererInterface,
          }
        ),
      ];
    }

    return renders;
  }
}
