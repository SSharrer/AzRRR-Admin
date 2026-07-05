import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app/routes';
import { ShellComponent } from './app/shell.component';
import { tokenInterceptor } from './app/core/token.interceptor';


bootstrapApplication(ShellComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([tokenInterceptor])
    ),
    provideAnimations(),
  ]
});