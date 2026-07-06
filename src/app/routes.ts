import { Routes } from '@angular/router';

import { LoginComponent } from './views/login.component';
import { RoundListComponent } from './views/round-list.component';
import { AuthGuard } from './core/auth.guard';
import { MemberListComponent } from './views/member-list.component';
import { TagListComponent } from './views/tag-list.component';
import { HomeComponent } from './views/home.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'rounds', component: RoundListComponent, canActivate: [AuthGuard] },
  { path: 'members', component: MemberListComponent, canActivate: [AuthGuard] },
  { path: 'tags', component: TagListComponent, canActivate: [AuthGuard] },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }
];