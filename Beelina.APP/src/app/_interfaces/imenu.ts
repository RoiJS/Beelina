import { PermissionLevelEnum } from '../_enum/permission-level.enum';

export interface IMenu {
  name: string;
  url?: string;
  icon?: string;
  fragment?: string;
  children?: IMenu[];
  minimumPermissionLevel?: number;
}
