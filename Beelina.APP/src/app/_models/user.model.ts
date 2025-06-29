import { BusinessModelEnum } from '../_enum/business-model.enum';
import { GenderEnum } from '../_enum/gender.enum';
import { ModuleEnum } from '../_enum/module.enum';
import {
  PermissionLevelEnum,
  getPermissionLevelEnum,
} from '../_enum/permission-level.enum';
import { getSalesAgentTypeEnum as getSalesAgentType, SalesAgentTypeEnum } from '../_enum/sales-agent-type.enum';
import { Entity } from './entity.model';
import { UserCredentials } from './user-credentials';
import { UserModulePermission } from './user-module-permission';
import { UserSetting } from './user-setting';

export class User extends Entity {
  public firstName: string;
  public middleName: string;
  public lastName: string;
  public username: string;
  public password: string;
  public gender: GenderEnum;
  public emailAddress: string;
  public businessModel: BusinessModelEnum;
  public salesAgentType: SalesAgentTypeEnum;
  public credentials: UserCredentials;
  public userPermissions: UserModulePermission[];
  public userSettings: UserSetting;
  public userType: string;

  constructor() {
    super();
    this.credentials = new UserCredentials();
    this.userPermissions = new Array<UserModulePermission>();
    this.userSettings = new UserSetting();
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

  getSalesAgentType(salesAgentType: number): SalesAgentTypeEnum {
    return getSalesAgentType(salesAgentType);
  }

  get fullname(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }
}
