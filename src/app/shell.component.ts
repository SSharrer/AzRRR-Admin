import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import * as bootstrap from "bootstrap"
import { Subject, takeUntil } from "rxjs";

import { AuthService } from "./services/auth.service";
import { AppService } from "./services/app.service";

import { OrgSummaryComponent } from "./views/org-summary.component";

import * as Constant from './core/constant';
@Component({
  selector: 'app-root',
  templateUrl: './shell.component.html'
})
export class ShellComponent implements OnInit, OnDestroy {

  @ViewChild(OrgSummaryComponent)
  orgSummaryComponent: OrgSummaryComponent;

  private _busyModal: bootstrap.Modal;

  private _destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private appService: AppService
  ) {}

  ngOnInit(): void {
    this._busyModal = new bootstrap.Modal(Constant.Modal.busySpinner, {
      backdrop: 'static',
      keyboard: false
    });

    this.appService.busyCount$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(count => {
      if (count > 0) {
        this._busyModal.show();
      } else {
        this._busyModal.hide();
      }
    })
  }

  ngOnDestroy(): void {
    this._destroy$.next(null);
    this._destroy$.complete();
  }
  
  // click handlers

  onClickShowOrgSummary(): void {
    console.log('onClickShowOrgSummary');
    const modalRef = new bootstrap.Modal(Constant.Modal.orgSummary, {
      backdrop: 'static',
      keyboard: false
    });

    this.orgSummaryComponent.initialize(modalRef);

    modalRef.show();
  }  

  // ui helpers

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated;
  }

  get orgName(): string {
    return this.authService.getOrg()?.name;
  }
}