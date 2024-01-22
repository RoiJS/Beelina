import { Component, OnInit } from '@angular/core';
import { SharedComponent } from '../shared/components/shared/shared.component';
import { AuthService } from '../_services/auth.service';
import { UIService } from '../_services/ui.service';

@Component({
  selector: 'app-admin-dashoard',
  templateUrl: './admin-dashoard.component.html',
  styleUrls: ['./admin-dashoard.component.scss']
})
export class AdminDashoardComponent extends SharedComponent implements OnInit {

  constructor(private authService: AuthService,
    override uiService: UIService) {
    super(uiService);
  }

  override ngOnInit() {
    super.ngOnInit();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
  }

  override ngAfterContentChecked() {
    super.ngAfterContentChecked();
  }

  signOut() {
    this.authService.logout();
  }
}
