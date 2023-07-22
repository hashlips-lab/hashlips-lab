export interface InputInitPropsInterface {
  seed: string;
}

export default interface InputInterface<InputDataType> {
  init: (props: InputInitPropsInterface) => Promise<void>;
  load: () => Promise<InputDataType>;
}
