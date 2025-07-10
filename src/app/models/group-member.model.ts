import { Member } from "./member.model";

export class GroupMember {
  groupMemberID: number;
  memberID: number;
  roundID: number;
  facilitator: string;
  groupNo: number;
  lastModifiedDate: Date;
  sendEmail: string;
  member: Member;
}