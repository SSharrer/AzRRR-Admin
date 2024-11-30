import { OrgSummary } from "../models/org.model";

export class LoginRequest {
  emailAddress: string;
  password: string;
}

export class LoginRequestResult {
  status: LoginRequestStatus;
  token: string;
  org: OrgSummary;
}

export enum LoginRequestStatus {
	error,
	successful,
	accountDoesNotExist,
	invalidPassword
}