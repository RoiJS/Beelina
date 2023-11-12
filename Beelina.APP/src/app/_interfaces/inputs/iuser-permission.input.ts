import { ModuleEnum } from 'src/app/_enum/module.enum';
import { PermissionLevelEnum } from 'src/app/_enum/permission-level.enum';

export interface IUserPermissionInput {
  id: number;
  moduleId: ModuleEnum;
  permissionLevel: PermissionLevelEnum;
}
