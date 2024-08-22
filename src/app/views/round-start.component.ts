import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import * as bootstrap from "bootstrap"

import { AuthService } from "../services/auth.service";
import { DataService } from "../services/data.service";
import { AppService } from "../services/app.service";

import { OrgSummary } from "../models/org.model";

@Component({
  selector: 'app-round-start',
  templateUrl: './round-start.component.html'
})
export class RoundStartComponent implements OnInit {

  @Output()
  saved = new EventEmitter<void>();
  
  parentModalRef: bootstrap.Modal;

  org: OrgSummary;
  startDate = new Date();

  roundForm: FormGroup<IFormModel>;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private appService: AppService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.org = this.authService.getOrg();
    this.createForm();
  }

  initialize(parentModdalRef: bootstrap.Modal): void {
    this.parentModalRef = parentModdalRef;
  }

  createForm(): void {
    this.roundForm = this.fb.group<IFormModel>({
      groupSize: new FormControl<number>(3, [ Validators.required ])
    });
  }

  // button handlers

  onClickStart(): void {
    if (this.roundForm.valid) {
      this.appService.incrementBusyCounter();
      this.dataService.startRound(this.org.orgID, this.roundForm.controls.groupSize.value).subscribe({
        error: () => {
          this.appService.decrementBusyCounter();
          window.alert('There was an error starting the new Round!');
        },
        complete: () => {
          this.appService.decrementBusyCounter();
          window.alert('New Round successfully started!');
          this.saved.emit();
          this.parentModalRef.hide();
        }
      })
    }
  }

  onClickCancel(): void {
    this.parentModalRef.hide();
  }
}

interface IFormModel {
  groupSize: FormControl<number>,
}