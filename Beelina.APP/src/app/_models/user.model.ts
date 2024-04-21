import { BusinessModelEnum } from '../_enum/business-model.enum';
import { GenderEnum } from '../_enum/gender.enum';
import { ModuleEnum } from '../_enum/module.enum';
import {
  PermissionLevelEnum,
  getPermissionLevelEnum,
} from '../_enum/permission-level.enum';
import { Entity } from './entity.model';
import { UserCredentials } from './user-credentials';
import { UserModulePermission } from './user-module-permission';

export class User extends Entity {
  public firstName: string;
  public middleName: string;
  public lastName: string;
  public username: string;
  public password: string;
  public gender: GenderEnum;
  public emailAddress: string;
  public businessModel: BusinessModelEnum;
  public credentials: UserCredentials;
  public userPermissions: UserModulePermission[];
  public userType: string;

  constructor() {
    super();
    this.credentials = new UserCredentials();
    this.userPermissions = new Array<UserModulePermission>();
  }

  getModulePrivilege(moduleId: ModuleEnum): { key: string; value: number | null } {
    const permission = this.userPermissions.find(
      (permission) => permission.moduleId === moduleId
    )?.permissionLevel;
    return {
      key: permission,
      value: getPermissionLevelEnum(permission)
    }
  }

  setModulePrivilege(moduleId: ModuleEnum, permission: PermissionLevelEnum) {
    const index = this.userPermissions.findIndex(
      (permission) => permission.moduleId === moduleId
    );
    if (index === -1) {
      const userPermission = new UserModulePermission();
      userPermission.moduleId = moduleId;
      userPermission.permissionLevel = permission;
      this.userPermissions.push(userPermission);
    } else {
      this.userPermissions[index].permissionLevel = permission;
    }
  }

  get fullname(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }
}
