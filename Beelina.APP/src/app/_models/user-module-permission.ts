import { ModuleEnum } from '../_enum/module.enum';
import { PermissionLevelEnum } from '../_enum/permission-level.enum';
import { Entity } from './entity.model';

export class UserModulePermission extends Entity {
  moduleId: ModuleEnum;
  permissionLevel: PermissionLevelEnum;
}
