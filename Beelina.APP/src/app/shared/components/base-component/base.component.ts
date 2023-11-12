import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { EmptyEntityTemplateEnum } from 'src/app/_enum/empty-entity-template.enum';
import { ModuleEnum } from 'src/app/_enum/module.enum';
import {
  PermissionLevelEnum,
  getPermissionLevelEnum,
} from 'src/app/_enum/permission-level.enum';
import { User } from 'src/app/_models/user.model';

@Component({
  selector: 'app-base-component',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
})
export class BaseComponent {
  protected _isLoading = false;
  protected _emptyTemplateType = EmptyEntityTemplateEnum;
  protected _permissionLevelEnum = PermissionLevelEnum;
  protected $isLoading: Observable<boolean>;
  protected _currentUser: User;

  constructor() {}

  getProductPhoto(name: string) {
    const products = [
      {
        name: 'Absolute Drinking Water',
        url: '../../../assets/products/AbsoluteDrinkingWater.jpg',
      },
      {
        name: 'Datu Puti Vinegar',
        url: '../../../assets/products/DatuPutiVinegar.jpg',
      },
      {
        name: 'Lucky Me Chicken Noodles',
        url: '../../../assets/products/LuckyMeChickenNoodles.jpg',
      },
      {
        name: 'Mega Sardines Green',
        url: '../../../assets/products/MegaSardinesGreen.jpg',
      },
      {
        name: 'Mega Sardines Red',
        url: '../../../assets/products/MegaSardinesRed.jpg',
      },
      {
        name: 'Piattos',
        url: '../../../assets/products/Piattos.jpg',
      },
    ];

    const photo =
      products.find((p) => p.name === name)?.url ||
      '../../assets/icons/box-product.png';

    return photo;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get emptyEntityTemplateEnum(): typeof EmptyEntityTemplateEnum {
    return this._emptyTemplateType;
  }

  //#region Permission Level related methods
  get permissionLevelEnum(): typeof PermissionLevelEnum {
    return this._permissionLevelEnum;
  }

  getPermissionLevel(permissionLevel: PermissionLevelEnum): number {
    return getPermissionLevelEnum(permissionLevel);
  }

  modulePrivilege(module: ModuleEnum): number {
    return this._currentUser.getModulePrivilege(module);
  }
  //#endregion
}
