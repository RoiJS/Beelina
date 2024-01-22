import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/_services/auth.service';
import { UIService } from 'src/app/_services/ui.service';
import { SharedComponent } from 'src/app/shared/components/shared/shared.component';

@Component({
  selector: 'app-admin-navbar',
  templateUrl: './admin-navbar.component.html',
  styleUrls: ['./admin-navbar.component.scss']
})
export class AdminNavbarComponent extends SharedComponent implements OnInit {

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
