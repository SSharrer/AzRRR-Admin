import { Component, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";

import { AuthService } from "../services/auth.service";
import { AppService } from "../services/app.service";
import { DataService } from "../services/data.service";

import { EmailRequest } from "../requests/email.request";
import { OrgSummary } from "../models/org.model";


@Component({
  selector: 'app-member-email',
  templateUrl: './member-email.component.html'
})
export class MemberEmailComponent implements OnInit {
  
  parentModalRef: bootstrap.Modal;

  org: OrgSummary;

  emailForm: FormGroup<IEmailFormModel>;

constructor(
  private fb: FormBuilder,
  private authService: AuthService,
  private appService: AppService,
  private dataService: DataService
) {}


  ngOnInit(): void {
    this.org = this.authService.getOrg();
    this.createForm();  
  }

  initialize(parentModalRef: bootstrap.Modal): void {
    this.parentModalRef = parentModalRef;
    this.createForm();
  }

  createForm(): void {
    this.emailForm = this.fb.group<IEmailFormModel>({
      includeMembers: new FormControl<boolean>(true),
      emailSubject: new FormControl<string>(null, [ Validators.required ]),
      emailBody: new FormControl<string>(null, [ Validators.required ]),
      additionalRecipients: new FormArray<FormGroup<IRecipientFormModel>>([])
    })
  }

  // click hanlers

  onClickAddRecipient(): void {
    const recipientForm = this.fb.group<IRecipientFormModel>({
      recipientEmail: new FormControl<string>(null, [ Validators.email ])
    });
    this.emailForm.controls.additionalRecipients.push(recipientForm);
  }

  onClickRemoveRecipient(index: number): void {
    this.emailForm.controls.additionalRecipients.removeAt(index);
  }

  onClickSend(): void {
    if (!this.canSend) {
      return;
    }

    const request = this.buildEmailRequest();

    this.appService.incrementBusyCounter();
    this.dataService.sendMemberEmail(request).subscribe({
      error: () => {
        this.appService.decrementBusyCounter();
        window.alert('There was an error starting the new Round!');
      },
      complete: () => {
        this.appService.decrementBusyCounter();
        window.alert('Emails successfuly sent!');
        this.parentModalRef.hide();
      }
    })
  }

  onClickCancel(): void {
    this.parentModalRef?.hide();
  }

  // ui helpers

  get canSend(): boolean {
    return this.emailForm.valid;
  }

  // private methods

  buildEmailRequest(): EmailRequest {
    const request = new EmailRequest();
    const values = this.emailForm.getRawValue();

    request.orgID = this.org.orgID;
    request.includeMembers = values.includeMembers;
    request.emailSubject = values.emailSubject;
    request.emailBody = values.emailBody;
    request.additionalRecipients = [];

    for (const additionRecipient of this.emailForm.controls.additionalRecipients.controls) {
      if (additionRecipient.controls.recipientEmail.value) {
        request.additionalRecipients.push(additionRecipient.controls.recipientEmail.value);
      }
    }

    return request;
  }
}

interface IEmailFormModel {
  includeMembers: FormControl<boolean>;
  emailSubject: FormControl<string>;
  emailBody: FormControl<string>;
  additionalRecipients: FormArray<FormGroup<IRecipientFormModel>>
}

interface IRecipientFormModel {
  recipientEmail: FormControl<string>;
}
