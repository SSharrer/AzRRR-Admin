export class ResetMemberPasswordRequest {
  orgID: number;
  password: string;
  memberIDs: number[];
  sendEmailNotification: boolean;
}