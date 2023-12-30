import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-loader-layout',
  templateUrl: './loader-layout.component.html',
  styleUrls: ['./loader-layout.component.scss']
})
export class LoaderLayoutComponent implements OnInit {
  @Input() busy = false;
  @Input() label: string;

  constructor(private translateService: TranslateService) {
    this.label = this.translateService.instant('LOADER_LAYOUT.LOADING_TEXT');
  }

  ngOnInit() { }
}
