import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import * as bootstrap from "bootstrap"

import { DataService } from "../services/data.service";
import { AppService } from "../services/app.service";

import { Member } from "../models/member.model";

@Component({
  selector: 'app-member-details',
  templateUrl: './member-details.component.html'
})
export class MemberDetailsComponent implements OnInit {

  @Output()
  saved = new EventEmitter<void>();

  member: Member;
  isNew: boolean;
  parentModalRef: bootstrap.Modal;

  memberForm: FormGroup<IFormModel>;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private appService: AppService
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  initialize(member: Member, isNew: boolean, parentModalRef: bootstrap.Modal): void {
    this.member = member;
    this.isNew = isNew;
    this.parentModalRef = parentModalRef;

    this.createForm();
    this.updateFormFromModel();
  }

  createForm(): void {
    this.memberForm = this.fb.group<IFormModel>({
      firstName: new FormControl<string>(null, [ Validators.required ]),
      lastName: new FormControl<string>(null, [ Validators.required ]),
      phone: new FormControl<string>(null),
      email: new FormControl<string>(null, [ Validators.required ])
    });
  }

  updateFormFromModel(): void {
    this.memberForm.controls.firstName.setValue(this.member.firstName);
    this.memberForm.controls.lastName.setValue(this.member.lastName);
    this.memberForm.controls.phone.setValue(this.member.phone);
    this.memberForm.controls.email.setValue(this.member.email);
  }

  updateModelFromForm(): void {
    this.member.firstName = this.memberForm.controls.firstName.value;
    this.member.lastName = this.memberForm.controls.lastName.value;
    this.member.phone = this.memberForm.controls.phone.value;
    this.member.email = this.memberForm.controls.email.value;
  }

  // button handlers

  onClickSave(): void {
    if (this.memberForm.valid) {
      this.updateModelFromForm();
      
      const save$ = this.isNew
      ? this.dataService.createMember(this.member)
      : this.dataService.updateMember(this.member)

      this.appService.incrementBusyCounter();
      save$.subscribe({
        error: (error: HttpErrorResponse) => {
          // TODO: constants file
          this.appService.decrementBusyCounter();
          if (error.status === 400 && error.error === 'Email exists') {
            window.alert('Email is in use already.  Please enter a different email.')
          } else {
            window.alert('There was an error saving the Member!')
          }
        },
        complete: () => {
          this.appService.decrementBusyCounter();
          this.saved.emit();
          this.parentModalRef?.hide();
        }
      }); 
    }
  }

  onClickCancel(): void {
    this.parentModalRef?.hide();
  }
}

interface IFormModel {
  lastName: FormControl<string>,
  firstName: FormControl<string>,
  phone: FormControl<string>,
  email: FormControl<string>
}