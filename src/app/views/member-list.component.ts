import { Component, OnInit, ViewChild, viewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
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
import { ModalResetPasswordComponent } from "./modal-reset-password.component";
import { Round } from "../models/round.model";
import { RoundSignupRequest } from "../requests/round-signup.request";
import { Tag } from "../models/tag.model";
import { BooleanToYesNoPipe } from "../core/boolean-yesno.pipe";

import * as Constant from "@app/core/constant";

@Component({
  selector: 'app-users',
  templateUrl: './member-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MemberDetailsComponent,
    MemberEmailComponent,
    ModalResetPasswordComponent,
    BooleanToYesNoPipe
  ]
})
export class MemberListComponent implements OnInit {
  
  @ViewChild(MemberDetailsComponent)
  memberDetailsComponent: MemberDetailsComponent;

  @ViewChild(MemberEmailComponent)
  memberEmailComponent: MemberEmailComponent;

  @ViewChild(ModalResetPasswordComponent)
  modalResetPasswordComponent: ModalResetPasswordComponent;

  org: OrgSummary;
  members: Member[] = [];
  tags: Tag[] = [];
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
    tasks.push(this.loadTags$());

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

  loadTags$(): Observable<any> {
    return this.dataService.getAllTags(this.org.orgID).pipe(
      tap(tags => {
        this.tags = sortBy(tags, t => t.name);
      })
    );
  }

  loadActiveRound$(): Observable<any> {
    return this.dataService.getActiveRound(this.org.orgID).pipe(
      tap(round => {
        this.activeRound = round;
      })
    );
  }

  // click handlers

  onClickEditMember(member: Member): void {
    const memberClone = cloneDeep(member);

    const modalRef = new bootstrap.Modal(Constant.Modal.memberDetails, {
      backdrop: 'static',
      keyboard: false
    });
    
    this.memberDetailsComponent.initialize(memberClone, false, this.tags, modalRef);

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

    this.memberDetailsComponent.initialize(member, true, this.tags, modalRef);

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

  onClickResetPassword(): void {
    if (!this.hasSelectedMembers) {
      return;
    }

    const modalRef = new bootstrap.Modal(Constant.Modal.resetPassword, {
      backdrop: 'static',
      keyboard: false
    });

    this.modalResetPasswordComponent.initialize(modalRef, this.members.filter(member => member.selected));
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
          window.alert(Constant.ErrorMessage.default);
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

  get hasSelectedMembers(): boolean {
    return !isEmpty(this.members) && this.members.some(m => m.selected);
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
    this.dataService.deleteMember(memberID).pipe(
      finalize(() => this.appService.decrementBusyCounter())
    ).subscribe({
      error: () => {
        window.alert("There was an error deleting the Member!");
      },
      complete: () => {
        window.alert('Member successfully deleted!');
        this.loadMembers();
      }
    })
  }
}

