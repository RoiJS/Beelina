import { PermissionLevelEnum } from '../_enum/permission-level.enum';

export interface IMenu {
  name: string;
  url?: string;
  icon?: string;
  fragment?: string;
  children?: IMenu[];
  isExternalUrl?: boolean;
  minimumPermissionLevel?: number;
  maximumPermissionLevel?: number;
}
