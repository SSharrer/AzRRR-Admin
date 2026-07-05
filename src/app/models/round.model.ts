import { GroupMember } from "./group-member.model";
import { RoundSignup } from "./round-signup.model";
import { RoundTag } from "./round-tag.model";

export class Round {
  roundID: number;
  orgID: number;
  beginDate: Date;
  endDate: Date;
  groupSize: number;
  clubRoundID: number;
  noRoundsChecked: number;
  readyToSendEmail: string;
  readyToSendNewRoundEmail: string;
  readyToMakeGroups: string;
  dQ1: string;
  dQ2: string;
  dQ3: string;
  dQ4: string;
  dQ5: string;

  groupMembers: GroupMember[];
  roundSignups: RoundSignup[];
  roundTags: RoundTag[] = [];

  // derived properties
  tagsString: string; 
}