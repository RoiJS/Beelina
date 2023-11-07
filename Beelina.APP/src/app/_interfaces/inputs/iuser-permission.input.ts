import { ModuleEnum } from 'src/app/_enum/module.enum';
import { PermissionLevelEnum } from 'src/app/_enum/permission-level.enum';

export interface IUserPermissionInput {
  moduleId: ModuleEnum;
  permissionLevel: PermissionLevelEnum;
}
