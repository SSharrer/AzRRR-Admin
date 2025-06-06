import { Component, OnInit, ViewChild, viewChild } from "@angular/core";
import { finalize, forkJoin, Observable, tap } from "rxjs";
import { cloneDeep, isEmpty, isNil, sortBy } from "lodash";
import * as bootstrap from "bootstrap"

import { AuthService } from "../services/auth.service";
import { AppService } from "../services/app.service";
import { DataService } from "../services/data.service";

import { OrgSummary } from "../models/org.model";
import { Member } from "../models/member.model";
import { MemberDetailsComponent } from "./member-details.component";
import { MemberEmailComponent } from "./member-email.component";

import * as Constant from '../core/constant';
import { Round } from "../models/round.model";
import { RoundSignupRequest } from "../requests/round-signup.request";

@Component({
  selector: 'app-users',
  templateUrl: './member-list.component.html'
})
export class MemberListComponent implements OnInit {
  
  @ViewChild(MemberDetailsComponent)
  memberDetailsComponent: MemberDetailsComponent;

  @ViewChild(MemberEmailComponent)
  memberEmailComponent: MemberEmailComponent;

  org: OrgSummary;
  members: Member[] = [];
  activeRound: Round = null;

  constructor(
    private authService: AuthService,
    private appService: AppService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.org = this.authService.getOrg();

    const tasks = [];
    tasks.push(this.loadActiveRound$());
    tasks.push(this.loadMembers$());

    this.appService.incrementBusyCounter();
    forkJoin(tasks).pipe(
      finalize(() => this.appService.decrementBusyCounter())
    ).subscribe({
      error: () => {
        window.alert("There was an error loading Members!")
      }
    })
  }


  // load data methods

  loadMembers(): void {
    this.appService.incrementBusyCounter();
    this.loadMembers$().pipe(
      finalize(() => this.appService.decrementBusyCounter())
    ).subscribe({
      error: () => {
        window.alert("There was an error loading Members!")
      }
    })
  }

  loadMembers$(): Observable<any> {
    return this.dataService.getAllMembers(this.org.orgID).pipe(
      tap(members => {
        this.members = sortBy(members, m => m.displayName)
      })
    );
  }

  loadActiveRound$(): Observable<any> {
    return this.dataService.getActiveRound(this.org.orgID).pipe(
      tap(round => {
        this.activeRound = round;
      })
    )
  }

  // click handlers

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

  onClickEmailMembers(): void {
    const modalRef = new bootstrap.Modal(Constant.Modal.memberEmail, {
      backdrop: 'static',
      keyboard: false
    });

    this.memberEmailComponent.initialize(modalRef);

    modalRef.show();
  }

  onClickSignupMembers(): void {
    if (!this.canSignupMembers) {
      return;
    }

    if (window.confirm("Signup selected Members to current Round?")) {
      var request = new RoundSignupRequest();
      request.orgID = this.activeRound.orgID;
      request.roundID = this.activeRound.roundID;
      request.clubRoundID = this.activeRound.clubRoundID;
      request.memberIDs = this.members.filter(m => m.selected).map(m => m.memberID);

      this.appService.incrementBusyCounter();
      this.dataService.signupMultipleForRound(request).pipe(
        finalize(() => this.appService.decrementBusyCounter())
      ).subscribe({
        error: () => {
          window.alert("There was an error processing your request!");
        },
        complete: () => {
          window.alert("Selected Members signed up to Active Round!");
        }
      });
    }
  }

  onSelectMember(member: Member): void {
    member.selected = !member.selected;
  }

  // ui helpers

  get hasActiveRound(): boolean {
    return !isNil(this.activeRound);
  }

  get canSignupMembers(): boolean {
    return this.hasActiveRound
      ? !isEmpty(this.members)
        ? this.members.some(m => m.selected)
        : false
      : false;
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
        this.loadMembers$();
      }
    })
  }
}

