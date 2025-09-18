import { Injectable } from '@angular/core';

export interface ShuffleResult<T> {
  shuffledItems: T[];
  movedItems: Set<any>;
  movementDirections: Map<any, 'up' | 'down'>;
}

export interface TrackableItem {
  id: any;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class ListShufflerService {

  constructor() { }

  /**
   * Shuffles a list of items and tracks movement directions
   * @param items Array of items to shuffle (must have an 'id' property)
   * @param previousIndexMap Optional map of previous positions for movement tracking
   * @param enableLogging Whether to log movement details to console
   * @returns ShuffleResult containing shuffled items and movement tracking data
   */
  shuffleWithMovementTracking<T extends TrackableItem>(
    items: T[],
    previousIndexMap?: Map<any, number>,
    enableLogging: boolean = false
  ): ShuffleResult<T> {

    if (!items?.length) {
      return {
        shuffledItems: [],
        movedItems: new Set(),
        movementDirections: new Map()
      };
    }

    // Build previous index map if not provided
    const prevIndexMap = previousIndexMap || this.buildIndexMap(items);

    // Fisher-Yates shuffle
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Compute movement info
    const movedItems = new Set<any>();
    const movementDirections = new Map<any, 'up' | 'down'>();

    shuffled.forEach((item, newIdx) => {
      const oldIdx = prevIndexMap.get(item.id);
      if (oldIdx === undefined) return;

      if (oldIdx !== newIdx) {
        movedItems.add(item.id);
        // Lower index = higher in list = moved up, higher index = lower in list = moved down
        const direction = newIdx < oldIdx ? 'up' : 'down';
        movementDirections.set(item.id, direction);

        if (enableLogging) {
          const itemName = this.getItemDisplayName(item);
          console.log(`${itemName}: ${oldIdx} → ${newIdx} (${direction})`);
        }
      }
    });

    return {
      shuffledItems: shuffled,
      movedItems,
      movementDirections
    };
  }

  /**
   * Builds an index map from a list of items
   * @param items Array of items with id property
   * @returns Map of item id to index position
   */
  buildIndexMap<T extends TrackableItem>(items: T[]): Map<any, number> {
    return new Map<any, number>(items?.map((item, index) => [item.id, index]) ?? []);
  }

  /**
   * Creates a simple shuffle without movement tracking
   * @param items Array of items to shuffle
   * @returns Shuffled array
   */
  simpleShuffleInPlace<T>(items: T[]): T[] {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Sorts items with movement tracking (for when you have real ranking metrics)
   * @param items Array of items to sort
   * @param sortFn Comparison function for sorting
   * @param previousIndexMap Optional map of previous positions
   * @param enableLogging Whether to log movement details to console
   * @returns ShuffleResult containing sorted items and movement tracking data
   */
  sortWithMovementTracking<T extends TrackableItem>(
    items: T[],
    sortFn: (a: T, b: T) => number,
    previousIndexMap?: Map<any, number>,
    enableLogging: boolean = false
  ): ShuffleResult<T> {

    if (!items?.length) {
      return {
        shuffledItems: [],
        movedItems: new Set(),
        movementDirections: new Map()
      };
    }

    // Build previous index map if not provided
    const prevIndexMap = previousIndexMap || this.buildIndexMap(items);

    // Sort the items
    const sorted = [...items].sort(sortFn);

    // Compute movement info
    const movedItems = new Set<any>();
    const movementDirections = new Map<any, 'up' | 'down'>();

    sorted.forEach((item, newIdx) => {
      const oldIdx = prevIndexMap.get(item.id);
      if (oldIdx === undefined) return;

      if (oldIdx !== newIdx) {
        movedItems.add(item.id);
        const direction = newIdx < oldIdx ? 'up' : 'down';
        movementDirections.set(item.id, direction);

        if (enableLogging) {
          const itemName = this.getItemDisplayName(item);
          console.log(`${itemName}: ${oldIdx} → ${newIdx} (${direction})`);
        }
      }
    });

    return {
      shuffledItems: sorted,
      movedItems,
      movementDirections
    };
  }

  /**
   * Helper method to get a display name for logging
   * Tries common properties like name, fullname, title, etc.
   */
  private getItemDisplayName<T extends TrackableItem>(item: T): string {
    const possibleNames = ['fullname', 'name', 'title', 'label', 'displayName'];

    for (const prop of possibleNames) {
      if (item[prop] && typeof item[prop] === 'string') {
        return item[prop];
      }
    }

    return `Item ${item.id}`;
  }
}
