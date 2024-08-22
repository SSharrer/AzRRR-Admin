import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { AuthService } from "../services/auth.service";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.authService.isAuthenticated) {
      // add auth token!
      const authToken = this.getAuthToken();
      const newReq = req.clone({
          headers: req.headers.set('Authorization', authToken).set('Content-Type', 'application/json')
      });
      return next.handle(newReq);
    } else {
      // do nothing!
      return next.handle(req);
    }
  }

  // private methods
  
  private getAuthToken(): string {
    let token: string = null;
    if (this.authService.isAuthenticated) {
        token = 'Bearer ' + this.authService.getAuthToken();
    }
    return token;
  }
}