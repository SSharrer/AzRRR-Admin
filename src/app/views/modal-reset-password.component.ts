import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EMPTY, finalize, switchMap } from 'rxjs';
import { Member } from '../models/member.model';
import { ResetMemberPasswordRequest } from '../requests/reset-password.request';
import { AppService } from '../services/app.service';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-modal-reset-password',
  standalone: true,
  templateUrl: './modal-reset-password.component.html',
  imports: [ReactiveFormsModule]
})
export class ModalResetPasswordComponent {
  parentModalRef: bootstrap.Modal;
  resetPasswordForm: FormGroup<IResetPasswordFormModel>;
  memberNames = '';
  showPassword = false;
  private members: Member[] = [];

  constructor(
    private fb: FormBuilder,
    private appService: AppService,
    private dataService: DataService
  ) {
    this.createForm();
  }

  initialize(parentModalRef: bootstrap.Modal, members: Member[]): void {
    this.parentModalRef = parentModalRef;
    this.members = members;
    this.memberNames = members.map(member => `${member.firstName} ${member.lastName}`).join(', ');
    this.createForm();
  }

  onOK(): void {
    if (this.resetPasswordForm.invalid || this.members.length === 0) {
      return;
    }

    const request = new ResetMemberPasswordRequest();
    request.orgID = this.members[0].orgID;
    request.password = this.resetPasswordForm.controls.password.value;
    request.memberIDs = this.members.map(member => member.memberID);
    request.sendEmailNotification = this.resetPasswordForm.controls.sendEmailNotification.value;

    this.appService.incrementBusyCounter();
    this.dataService.passwordMeetsComplexity(request.password).pipe(
      switchMap(passwordMeetsComplexity => {
        if (!passwordMeetsComplexity) {
          window.alert('The password does not meet the required complexity.');
          return EMPTY;
        }
        return this.dataService.resetMemberPassword(request);
      }),
      finalize(() => this.appService.decrementBusyCounter())
    ).subscribe({
      next: () => {
        window.alert('Selected Member passwords successfully reset!');
        this.parentModalRef?.hide();
      },
      error: () => {
        window.alert('There was an error resetting the selected Member passwords!');
      }
    });
  }

  onClickCancel(): void {
    this.parentModalRef?.hide();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private createForm(): void {
    this.resetPasswordForm = this.fb.group<IResetPasswordFormModel>({
      password: new FormControl<string>(null, [Validators.required]),
      sendEmailNotification: new FormControl<boolean>(false)
    });
  }
}

interface IResetPasswordFormModel {
  password: FormControl<string>;
  sendEmailNotification: FormControl<boolean>;
}
