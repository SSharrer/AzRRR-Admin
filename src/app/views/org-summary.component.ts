import { Component } from "@angular/core";
import { Router } from "@angular/router";
import * as bootstrap from "bootstrap"

import { AuthService } from "../services/auth.service";

@Component({
  selector: 'app-org-summary',
  templateUrl: './org-summary.component.html'
})
export class OrgSummaryComponent {

  parentModalRef: bootstrap.Modal

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  initialize(parentModalRef: bootstrap.Modal): void {
    this.parentModalRef = parentModalRef;
  }

  // button handlers

  onClickClose(): void {
    this.parentModalRef?.hide();
  }

  onClickLogout(): void {
    this.parentModalRef?.hide();
    this.authService.logout();
    this.router.navigateByUrl('/login');  
  }

  // ui helpers
  
  get orgName(): string {
    return this.authService.getOrg()?.name;
  }

  get joinCode(): string {
    return this.authService.getOrg()?.joinCode;
  }
}