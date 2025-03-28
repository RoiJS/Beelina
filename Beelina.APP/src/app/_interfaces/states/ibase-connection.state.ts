export interface IBaseStateConnection {
  hasNextPage: boolean;
  filterKeyword: string;
  endCursor?: string;
  skip?: number;
  take?: number;
}
