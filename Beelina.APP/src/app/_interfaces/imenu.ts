export interface IMenu {
  name: string;
  url?: string;
  fragment?: string;
  children?: IMenu[];
}
