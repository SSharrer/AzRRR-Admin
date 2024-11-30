export class EmailRequest {
  orgID: number;
  includeMembers: boolean;
  emailSubject: string;
  emailBody: string;
  additionalRecipients: string[]
}