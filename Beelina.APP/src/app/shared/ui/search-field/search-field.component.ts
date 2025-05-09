import { Component, OnInit, inject, input, output } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-search-field',
  templateUrl: './search-field.component.html',
  styleUrls: ['./search-field.component.scss'],
})
export class SearchFieldComponent implements OnInit {
  placeHolderTextIdentifier = input<string>('');
  filterActive = input<boolean>(false);
  filter = input<boolean>(false);
  onSearch = output<string>();
  onClear = output<string>();
  onFilter = output<string>();

  private _searchForm: FormGroup;

  private formBuilder = inject(FormBuilder);
  private translateService = inject(TranslateService);

  constructor() {
    this._searchForm = this.formBuilder.group({
      filterKeyword: [''],
    });
  }

  ngOnInit() { }

  onSubmit() {
    const field = this._searchForm.get('filterKeyword').value;
    this.onSearch.emit(field);
  }

  openFilter() {
    this.onFilter.emit('');
  }

  clear() {
    this._searchForm.get('filterKeyword').setValue('');
    this.onClear.emit('');
  }

  value(filterKeyword: string = ''): string {
    if (filterKeyword.length > 0) {
      this._searchForm.get('filterKeyword').setValue(filterKeyword);
    }
    return this._searchForm.get('filterKeyword').value;
  }

  get searchForm(): FormGroup {
    return this._searchForm;
  }

  get placeHolder(): string {
    return this.translateService.instant(this.placeHolderTextIdentifier());
  }
}
