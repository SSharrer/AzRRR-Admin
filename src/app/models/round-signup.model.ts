import { Member } from "./member.model";

export class RoundSignup {
  iD: number;
  orgID: number;
  RoundID: number;
  clubRoundID: number;
  memberID: number;
  lastModifiedDate: Date;
  member: Member
}