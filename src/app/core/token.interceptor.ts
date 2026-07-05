import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  if (authService.isAuthenticated) {
    const token = 'Bearer ' + authService.getAuthToken();
    const newReq = req.clone({
      headers: req.headers
        .set('Authorization', token)
        .set('Content-Type', 'application/json')
    });
    return next(newReq);
  } else {
    return next(req);
  }
};