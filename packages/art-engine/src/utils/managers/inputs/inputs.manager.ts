import InputInterface from "../../../common/inputs/input.interface";

type InputDataType = Awaited<ReturnType<InputInterface<any>["load"]>>;

export default class InputsManager {
  private isReadOnlyMode: boolean;
  private inputsData: { [key: string]: InputDataType };

  constructor() {
    this.isReadOnlyMode = false;
    this.inputsData = {};
  }

  public freeze(): void {
    this.isReadOnlyMode = true;
  }

  public get(key: string): InputDataType {
    if (!(key in this.inputsData)) {
      throw new Error(`Getting a request for unknown input: "${key}"`);
    }

    return this.inputsData[key];
  }

  public set(key: string, data: InputDataType): void {
    if (this.isReadOnlyMode) {
      throw new Error(
        `Trying to update data on a frozen InputManager (key: "${key}")`
      );
    }

    if (key in this.inputsData) {
      throw new Error(
        `Trying to overwrite input date for an existing key: "${key}"`
      );
    }

    this.inputsData[key] = data;
  }
}
