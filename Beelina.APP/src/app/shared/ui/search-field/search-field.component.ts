import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-search-field',
  templateUrl: './search-field.component.html',
  styleUrls: ['./search-field.component.scss'],
})
export class SearchFieldComponent implements OnInit {
  @Input() placeHolderTextIdentifier: string = '';
  @Output() onSearch = new EventEmitter<string>();

  private _searchForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private translateService: TranslateService
  ) {
    this._searchForm = this.formBuilder.group({
      filterKeyword: [''],
    });
  }

  ngOnInit() { }

  onSubmit() {
    const field = this._searchForm.get('filterKeyword').value;
    this.onSearch.emit(field);
  }

  clear() {
    this._searchForm.get('filterKeyword').setValue('');
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
    return this.translateService.instant(this.placeHolderTextIdentifier);
  }
}
