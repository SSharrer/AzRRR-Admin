import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import * as bootstrap from "bootstrap"

import { DataService } from "../services/data.service";
import { AppService } from "../services/app.service";

import { Member } from "../models/member.model";
import { cloneDeep } from "lodash";
import { finalize } from "rxjs";

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
      email: new FormControl<string>(null, [ Validators.required, Validators.email ]),
      autoEnrollInNewRounds: new FormControl<boolean>(true)
    });
  }

  updateFormFromModel(): void {
    this.memberForm.controls.firstName.setValue(this.member.firstName);
    this.memberForm.controls.lastName.setValue(this.member.lastName);
    this.memberForm.controls.phone.setValue(this.member.phone);
    this.memberForm.controls.email.setValue(this.member.email);
    this.memberForm.controls.autoEnrollInNewRounds.setValue(this.member.autoEnrollInNewRounds);
  }

  getModelFromForm(): Member {
    const model = cloneDeep(this.member);

    model.firstName = this.memberForm.controls.firstName.value;
    model.lastName = this.memberForm.controls.lastName.value;
    model.phone = this.memberForm.controls.phone.value;
    model.email = this.memberForm.controls.email.value;
    model.autoEnrollInNewRounds = this.memberForm.controls.autoEnrollInNewRounds.value;

    return model;
  }

  // button handlers

  onClickSave(): void {
    if (this.memberForm.valid) {
      const model =  this.getModelFromForm();
      
      const save$ = this.isNew
      ? this.dataService.createMember(model)
      : this.dataService.updateMember(model)

      this.appService.incrementBusyCounter();
      save$.pipe(
        finalize(() => this.appService.decrementBusyCounter())
      ).subscribe({
        error: (error: HttpErrorResponse) => {
          // TODO: constants file
          if (error.status === 400 && error.error === 'Email exists') {
            window.alert('Email is in use already.  Please enter a different email.')
          } else {
            window.alert('There was an error saving the Member!')
          }
        },
        complete: () => {
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
  email: FormControl<string>,
  autoEnrollInNewRounds: FormControl<boolean>;
}