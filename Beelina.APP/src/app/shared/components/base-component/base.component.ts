import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { PlaceholderEntityTemplateEnum } from 'src/app/_enum/placeholder-entity-template.enum';
import { ModuleEnum } from 'src/app/_enum/module.enum';
import {
  PermissionLevelEnum,
  getPermissionLevelEnum,
} from 'src/app/_enum/permission-level.enum';
import { User } from 'src/app/_models/user.model';
import { TemplateSizeEnum } from '../../ui/placeholder-entities/placeholder-entities.component';
import { BannerTypeEnum } from '../../ui/banner/banner.component';
import { BusinessModelEnum } from 'src/app/_enum/business-model.enum';
import { TransactionStatusEnum } from 'src/app/_enum/transaction-status.enum';

@Component({
  selector: 'app-base-component',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
})
export class BaseComponent {
  protected _isLoading = false;
  protected _businessModelEnum = BusinessModelEnum;
  protected _permissionLevelEnum = PermissionLevelEnum;
  protected _emptyTemplateType = PlaceholderEntityTemplateEnum;
  protected _templateSize = TemplateSizeEnum;
  protected _bannerType = BannerTypeEnum;
  protected _transactionStatusType = TransactionStatusEnum;

  protected $isLoading: Observable<boolean>;
  protected _currentLoggedInUser: User;
  protected _passwordVisible: boolean;

  constructor() {
  }

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

      {
        name: 'Fruity Frost Orange',
        url: '../../../assets/products/AER/Fruity_Frost_Orange-removebg-preview.png',
      },
      {
        name: 'Fruity Frost Grapes',
        url: '../../../assets/products/AER/Fruity_Frost_Grapes-removebg-preview.png',
      },
      {
        name: 'Yumshots Mixed Nuts',
        url: '../../../assets/products/AER/Yumshots_Mixed_Snacks_70g-removebg-preview.png',
      },
      {
        name: 'Lumpia Shanghai Corn',
        url: '../../../assets/products/AER/Lumpia_Shanghai_Corn_65g-removebg-preview.png',
      },
      {
        name: 'Lumpia Shanghai Cheese',
        url: '../../../assets/products/AER/Lumpia_Shanghai_Cheese_65g-removebg-preview.png',
      },
      {
        name: 'Koolers Orange',
        url: '../../../assets/products/AER/Koolers_Orange_220ml-removebg-preview.png',
      },
      {
        name: 'Koolers Grapes',
        url: '../../../assets/products/AER/Koolers_Grapes_220ml-removebg-preview.png',
      },
      {
        name: 'Koolers Apple',
        url: '../../../assets/products/AER/Koolers_Apple_220ml-removebg-preview.png',
      },
      {
        name: 'Karoke Salted Garlic',
        url: '../../../assets/products/AER/Karoke_Salted_Garlic_70g-removebg-preview.png',
      },
      {
        name: "Brewster's White Coffee",
        url: '../../../assets/products/AER/Brewster_s_White_Coffee_30g-removebg-preview.png',
      },
      {
        name: "Brewster's Brown Coffee",
        url: '../../../assets/products/AER/Brewster_s_Brown_Coffee_25g-removebg-preview.png',
      },
      {
        name: "My Fries",
        url: '../../../assets/products/AER/my-fries.png',
      },
      {
        name: "Nata De Coco (Mixed Variant)",
        url: '../../../assets/products/AER/nata-de-coco-red.png',
      },
      {
        name: "Pampam",
        url: '../../../assets/products/AER/pampam.png',
      },
      {
        name: "Yumshots Tomato 60g",
        url: '../../../assets/products/AER/yumshots.png',
      },
      {
        name: "Kaong (Mixed Variant)",
        url: '../../../assets/products/AER/kaong-green.png',
      },
    ];

    const photo =
      products.find((p) => p.name === name)?.url ||
      'https://img.freepik.com/free-vector/3d-delivery-box-parcel_78370-825.jpg?t=st=1705089467~exp=1705090067~hmac=9b4ecc51db4b3c95dfa1536c71d8d48192f2946a8c990f18116d01113e3e592c';

    return photo;
  }

  //#region Permission Level related methods
  get permissionLevelEnum(): typeof PermissionLevelEnum {
    return this._permissionLevelEnum;
  }

  getPermissionLevel(permissionLevel: PermissionLevelEnum): number {
    return getPermissionLevelEnum(permissionLevel);
  }

  modulePrivilege(module: ModuleEnum): number {
    return this._currentLoggedInUser?.getModulePrivilege(module).value;
  }
  //#endregion

  findAllIndicesForMultiWordKeyword(mainString: string, multiWordKeyword: string) {
    const keywords = multiWordKeyword.split(' ').map(word => word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const regex = new RegExp(keywords.join('|'), "gi");

    let indices: { startIndex: number; endIndex: number }[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(mainString)) !== null) {
      const startIndex = match.index;
      const endIndex = startIndex + match[0].length - 1;
      indices.push({ startIndex, endIndex });
    }

    return indices.length > 0 ? indices : null;
  }
  insertMarkAtIndex(originalString: string, startIndex: number, endIndex: number) {
    if (startIndex < 0 || endIndex >= originalString.length || startIndex > endIndex) {
      console.error("Invalid indices");
      return originalString;
    }

    const prefix = originalString.slice(0, startIndex);
    const markedText = originalString.slice(startIndex, endIndex + 1);
    const suffix = originalString.slice(endIndex + 1);

    return `${prefix}<mark>${markedText}</mark>${suffix}`;
  }

  setPasswordVisibility() {
    this._passwordVisible = !this._passwordVisible;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get emptyEntityTemplateEnum(): typeof PlaceholderEntityTemplateEnum {
    return this._emptyTemplateType;
  }

  get emptyEntityTemplateSizeEnum(): typeof TemplateSizeEnum {
    return this._templateSize;
  }

  get bannerTypeEnum(): typeof BannerTypeEnum {
    return this._bannerType;
  }

  get businessModelEnum(): typeof BusinessModelEnum {
    return this._businessModelEnum;
  }

  get passwordVisible(): boolean {
    return this._passwordVisible;
  }
}
