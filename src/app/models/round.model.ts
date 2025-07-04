import { GroupMember } from "./group-member.model";
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
  groupMembers: GroupMember[];
  roundTags: RoundTag[] = [];

  // derived properties
  tagsString: string; 
}