import { Component, inject, OnInit, output } from '@angular/core';

import { User } from 'src/app/_models/user.model';

import { ProductService } from 'src/app/_services/product.service';
import { UIService } from 'src/app/_services/ui.service';

import { SharedComponent } from 'src/app/shared/components/shared/shared.component';

@Component({
  selector: 'app-sales-agent-list',
  templateUrl: './sales-agent-list.component.html',
  styleUrls: ['./sales-agent-list.component.scss']
})
export class SalesAgentListComponent extends SharedComponent implements OnInit {

  selectSalesAgent = output<User>();
  initDefaultSalesAgent = output<User>();

  private _salesAgents: Array<User>;
  private _currentSalesAgent: User;
  private _productService = inject(ProductService);

  constructor(protected override uiService: UIService) {
    super(uiService);

    this._productService.getSalesAgentsList().subscribe({
      next: (data: Array<User>) => {
        this._salesAgents = data;
        this._currentSalesAgent = data[0];
        this.initDefaultSalesAgent.emit(this._currentSalesAgent);
      },
    });
  }

  override ngOnInit() {
  }

  selectSalesAgentEvent(salesAgent: User) {
    this._currentSalesAgent = salesAgent;
    this.selectSalesAgent.emit(salesAgent);
  }

  get salesAgents(): Array<User> {
    return this._salesAgents;
  }

  get currentSalesAgent(): number {
    return this._currentSalesAgent?.id;
  }
}
