import { Component } from "@angular/core";
import { sortBy } from "lodash";
import * as bootstrap from "bootstrap"

import { GroupMember } from "../models/group-member.model";

import * as Util from '../core/util';

@Component({
  selector: 'app-round-details',
  templateUrl: './round-details.component.html'
})
export class RoundDetailsComponent {

  roundDetailRows: RoundDetailRow[] = []
  parentModalRef: bootstrap.Modal

  initialize(groupMembers: GroupMember[], parentModalRef: bootstrap.Modal): void {
    this.parentModalRef = parentModalRef;

    const roundDetailRows: RoundDetailRow[] = []
    for (const groupMember of groupMembers ?? []) {
      const row = new RoundDetailRow();
      row.groupNumber = groupMember.groupNo;
      row.memberName = Util.Name.firstCommaLast(groupMember.member?.firstName, groupMember.member?.lastName);
      row.facilitator = groupMember.facilitator;
      row.email = groupMember.member?.email;
      roundDetailRows.push(row);
    }

    this.roundDetailRows = sortBy(roundDetailRows, r => r.groupNumber);
  }    

  // button handlers

  onClickClose(): void {
    this.parentModalRef?.hide();
  }
}

export class RoundDetailRow {
  groupNumber: number;
  memberName: string;
  facilitator: string;
  email: string;
}