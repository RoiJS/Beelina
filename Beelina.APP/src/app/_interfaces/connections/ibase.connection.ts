import { IEdge } from '../iedge';
import { IModelNode } from '../imodel-node';
import { IPageInfo } from '../ipage-info';

export interface IBaseConnection {
  edges: IEdge[];
  nodes: IModelNode[];
  pageInfo: IPageInfo;
  totalCount: number;
}
