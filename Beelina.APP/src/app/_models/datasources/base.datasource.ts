import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { AppStateInterface } from 'src/app/_interfaces/app-state.interface';

export class BaseDataSource<T> extends DataSource<T | undefined> {
  protected _pageSize = 100;
  protected _fetchedPages = new Set<number>();
  protected readonly _dataStream = new BehaviorSubject<(T | undefined)[]>([]);
  protected readonly _subscription = new Subscription();

  constructor(protected store: Store<AppStateInterface>) {
    super();
  }

  connect(collectionViewer: CollectionViewer): Observable<(T | undefined)[]> {
    this._subscription.add(
      collectionViewer.viewChange.subscribe((range) => {
        const startPage = this._getPageForIndex(range.start);
        const endPage = this._getPageForIndex(range.end);

        for (let i = startPage; i <= endPage; i++) {
          this._fetchPage(i);
        }
      })
    );
    return this._dataStream;
  }

  disconnect(): void {
    this._subscription.unsubscribe();
  }

  private _getPageForIndex(index: number): number {
    return Math.floor(index / this._pageSize);
  }

  private _fetchPage(page: number) {
    if (this._fetchedPages.has(page)) {
      return;
    }

    this._fetchedPages.add(page);
    this.fetchData();
  }

  fetchData() {
    throw new Error('Not implemented!');
  }

  get itemCount(): number {
    return this._dataStream.value.length;
  }
}
