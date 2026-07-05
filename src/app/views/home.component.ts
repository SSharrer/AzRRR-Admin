import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";

import { AuthService } from "../services/auth.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [
    CommonModule
  ]
})
export class HomeComponent {
  
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  // click handlers

  onClickManageUsers(): void {
    this.router.navigateByUrl('/members');
  }

  onClickManageRounds(): void {
    this.router.navigateByUrl('/rounds');
  }

  onClickManageTags(): void {
    this.router.navigateByUrl('/tags');
  }
}