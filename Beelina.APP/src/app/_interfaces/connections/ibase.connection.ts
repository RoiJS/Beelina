import { IEdge } from '../iedge';
import { IModelItem } from '../imodel-item';
import { IModelNode } from '../imodel-node';
import { IPageInfo } from '../ipage-info';

export interface IBaseConnection {
  edges: IEdge[];
  nodes: IModelNode[];
  items: IModelItem[];
  pageInfo: IPageInfo;
  totalCount: number;
}
