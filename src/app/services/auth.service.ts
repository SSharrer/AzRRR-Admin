import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { isNil } from "lodash";

import { LoginRequest, LoginRequestResult } from "../requests/login-request.model";
import { OrgSummary } from "../models/org.model";

import { environment } from "../../environments/environment";

@Injectable()
export class AuthService {
  
  private _authToken: string = null;
  private _org: OrgSummary = null;

  constructor(
    private http: HttpClient,
) {} 

  // web service calls

  login(request: LoginRequest): Observable<LoginRequestResult> {
    const url = environment.webApiBaseUrl + 'account/loginadmin';
    return this.http.post<LoginRequestResult>(url, request);
  }

  logout(): void {
    this.setAuthToken(null);
    this.setOrg(null);
  }

  // other methods

  getAuthToken(): string {
    return this._authToken;
  }

  setAuthToken(authToken: string): void {
    this._authToken = authToken;
  }

  setOrg(org: OrgSummary): void {
    this._org = org;
  }

  getOrg(): OrgSummary {
    return this._org;
  }

  get isAuthenticated(): boolean {
    return !isNil(this._authToken);
  }
}