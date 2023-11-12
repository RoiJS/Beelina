export enum PermissionLevelEnum {
  None = 'NONE',
  User = 'USER',
  Manager = 'MANAGER',
  Administrator = 'ADMINISTRATOR',
}

export function getPermissionLevelEnum(value: PermissionLevelEnum): number {
  switch (value) {
    case PermissionLevelEnum.None:
      return 0;
    case PermissionLevelEnum.User:
      return 1;
    case PermissionLevelEnum.Manager:
      return 2;
    case PermissionLevelEnum.Administrator:
      return 3;
    default:
      return -1;
  }
}
