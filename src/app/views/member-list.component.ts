import { Component, OnInit, ViewChild, viewChild } from "@angular/core";
import { tap } from "rxjs";
import { cloneDeep, sortBy } from "lodash";
import * as bootstrap from "bootstrap"

import { AuthService } from "../services/auth.service";
import { AppService } from "../services/app.service";
import { DataService } from "../services/data.service";

import { OrgSummary } from "../models/org.model";
import { Member } from "../models/member.model";
import { MemberDetailsComponent } from "./member-details.component";

import * as Constant from '../core/constant';

@Component({
  selector: 'app-users',
  templateUrl: './member-list.component.html'
})
export class MemberListComponent implements OnInit {
  
  @ViewChild(MemberDetailsComponent)
  memberDetailsComponent: MemberDetailsComponent

  org: OrgSummary;
  members: Member[] = [];

  constructor(
    private authService: AuthService,
    private appService: AppService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.org = this.authService.getOrg();
    this.loadMembers();
  }

  // load data methods

  loadMembers(): void {
    this.appService.incrementBusyCounter();
    this.dataService.getAllMembers(this.org.orgID).subscribe({
      next: members => {
        this.appService.decrementBusyCounter();
        this.members = sortBy(members, m => m.displayName)
      },
      error: () => {
        this.appService.decrementBusyCounter();
        window.alert("There was an error loading Members!")
      },
    });
  }

  // button handlers

  onClickEditMember(member: Member): void {
    const memberClone = cloneDeep(member);

    const modalRef = new bootstrap.Modal(Constant.Modal.memberDetails, {
      backdrop: 'static',
      keyboard: false
    });
    
    this.memberDetailsComponent.initialize(memberClone, false, modalRef);

    modalRef.show();
  }

  onClickDeleteMember(member: Member): void {
    if (window.confirm('Are you sure you want to delete this Member?')) {
      this.deleteMember(member.memberID);
    }
  }

  onClickNewMember(): void {
    const member = new Member();
    member.memberID = 0;
    member.orgID = this.org.orgID;

    const modalRef = new bootstrap.Modal(Constant.Modal.memberDetails, {
      backdrop: 'static',
      keyboard: false
    });

    this.memberDetailsComponent.initialize(member, true, modalRef);

    modalRef.show();
  }

  // private methods

  deleteMember(memberID: number): void {
    this.appService.incrementBusyCounter();
    this.dataService.deleteMember(memberID).subscribe({
      error: () => {
        this.appService.decrementBusyCounter();
        window.alert("There was an error deleting the Member!");
      },
      complete: () => {
        this.appService.decrementBusyCounter();
        window.alert('Member successfully deleted!');
        this.loadMembers();
      }
    })
  }
}
