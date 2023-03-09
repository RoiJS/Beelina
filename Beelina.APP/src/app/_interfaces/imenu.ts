export interface IMenu {
  name: string;
  url?: string;
  icon?: string;
  fragment?: string;
  children?: IMenu[];
}
