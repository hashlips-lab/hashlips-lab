import { ItemPropertiesInterface } from "./items-data.interface";

type ItemsDataType = {
  [itemUid: string]: ItemPropertiesInterface<any>[];
};

export default class ItemsDataManager {
  private areAttributesReadOnlyMode: boolean;
  private areRendersReadOnlyMode: boolean;
  private itemsAttributes: ItemsDataType;
  private itemsRenders: ItemsDataType;

  constructor() {
    this.areAttributesReadOnlyMode = false;
    this.areRendersReadOnlyMode = false;
    this.itemsAttributes = {};
    this.itemsRenders = {};
  }

  public freezeAttributes(): ItemsDataType {
    this.areAttributesReadOnlyMode = true;

    return this.itemsAttributes;
  }

  public freezeRenders(): ItemsDataType {
    this.areRendersReadOnlyMode = true;

    return this.itemsRenders;
  }

  public getAttributes(): ItemsDataManager["itemsAttributes"] {
    return this.itemsAttributes;
  }

  public addManyAttributes(data: ItemsDataType): void {
    if (this.areAttributesReadOnlyMode) {
      throw new Error(
        `Trying to add all attributes data on a frozen ItemsDataManager`
      );
    }
    this.itemsAttributes = { ...this.itemsAttributes, ...data };
  }

  public addAttributes(
    itemUid: string,
    attributes: ItemPropertiesInterface<any>[]
  ): void {
    if (this.areAttributesReadOnlyMode) {
      throw new Error(
        `Trying to add attributes data on a frozen ItemsDataManager (item: "${itemUid}")`
      );
    }

    this.itemsAttributes[itemUid] = (
      this.itemsAttributes[itemUid] ?? []
    ).concat(attributes);
  }

  public getRenders(): ItemsDataManager["itemsRenders"] {
    return this.itemsRenders;
  }

  public addManyRenders(data: ItemsDataType): void {
    if (this.areRendersReadOnlyMode) {
      throw new Error(
        `Trying to add all renders data on a frozen ItemsDataManager`
      );
    }
    this.itemsRenders = { ...this.itemsRenders, ...data };
  }

  public addRenders(
    itemUid: string,
    renders: ItemPropertiesInterface<any>[]
  ): void {
    if (this.areRendersReadOnlyMode) {
      throw new Error(
        `Trying to add renders data on a frozen ItemsDataManager (item: "${itemUid}")`
      );
    }

    this.itemsRenders[itemUid] = (this.itemsRenders[itemUid] ?? []).concat(
      renders
    );
  }
}
