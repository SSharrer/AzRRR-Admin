import { Member } from "./member.model";

export class GroupMember {
  groupMemberID: number;
  memberID: number;
  member: Member;
  roundID: number;
  facilitator: string;
  groupNo: number;
  lastModifiedDate: Date;
  sendEmail: string;
}