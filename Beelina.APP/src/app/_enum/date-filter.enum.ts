export enum DateFilterEnum {
  Daily = 1,
  Weekly = 2,
  Monthly = 3,
  Custom = 4,
}

export const DateFilterEnumLabels: { [key in DateFilterEnum]: string } = {
  [DateFilterEnum.Daily]: 'DAILY',
  [DateFilterEnum.Weekly]: 'WEEKLY',
  [DateFilterEnum.Monthly]: 'MONTHLY',
  [DateFilterEnum.Custom]: 'CUSTOM'
};
