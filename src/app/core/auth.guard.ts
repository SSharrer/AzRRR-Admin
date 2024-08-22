import { Injectable } from '@angular/core';
import { Router } from "@angular/router";

import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard  {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate() {
    if (this.authService.isAuthenticated) {
      return true;
    }

    this.router.navigateByUrl('/login');
    return false;
  }
}