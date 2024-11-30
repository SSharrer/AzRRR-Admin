import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { DataService } from './services/data.service';
import { AuthService } from './services/auth.service';
import { AppService } from './services/app.service';

import { AuthGuard } from './core/auth.guard';
import { TokenInterceptor } from './core/token.interceptor';

import { ShellComponent } from './shell.component';
import { BusySpinnerComponent } from './views/busy-spinner.component';
import { HomeComponent } from './views/home.component';
import { LoginComponent } from './views/login.component';
import { OrgSummaryComponent } from './views/org-summary.component';
import { RoundListComponent } from './views/round-list.component';
import { RoundDetailsComponent } from './views/round-details.component';
import { RoundStartComponent } from './views/round-start.component';
import { MemberListComponent } from './views/member-list.component';
import { MemberDetailsComponent } from './views/member-details.component';
import { MemberEmailComponent } from './views/member-email.component';

const routes: Routes =[
  { path: 'login', component: LoginComponent },
  { path: 'rounds', component: RoundListComponent, canActivate: [ AuthGuard ] },
  { path: 'members', component: MemberListComponent, canActivate: [ AuthGuard ] },
  { path: 'home', component: HomeComponent, canActivate: [ AuthGuard ] },
  // wildcards 
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }
];
@NgModule({
  declarations: [
    ShellComponent,
    BusySpinnerComponent,
    LoginComponent,
    HomeComponent,
    MemberListComponent,
    MemberDetailsComponent,
    MemberEmailComponent,
    RoundListComponent,
    RoundDetailsComponent,
    RoundStartComponent,
    OrgSummaryComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes)
  ],
  providers: [
    AuthService,
    AppService,
    DataService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
  }
  ],
  bootstrap: [ ShellComponent ]
})
export class AppModule {}