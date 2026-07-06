import { Component, EventEmitter, model, OnInit, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { cloneDeep, isNil, orderBy, sortBy } from "lodash";
import * as bootstrap from "bootstrap"
import { finalize } from "rxjs";

import { DataService } from "../services/data.service";
import { AppService } from "../services/app.service";

import { Round } from "../models/round.model";

import * as Util from '../core/util';

@Component({
  selector: 'app-round-details',
  templateUrl: './round-details.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class RoundDetailsComponent implements OnInit {

  @Output()
  saved = new EventEmitter<void>();
    
  parentModalRef: bootstrap.Modal

  round: Round = new Round;
  roundDetailRows: RoundDetailRow[] = [];
  signupDetailsRows: SignupRow[] = [];

  roundForm: FormGroup<IFormModel>;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private appService: AppService,
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  createForm(): void {
    this.roundForm = this.fb.group<IFormModel>({
      groupSize: new FormControl<number>(null, [ Validators.required ]),
      dq1: new FormControl<string>(null),
      dq2: new FormControl<string>(null),
      dq3: new FormControl<string>(null),
      dq4: new FormControl<string>(null),
      dq5: new FormControl<string>(null)
    });
  }

  initialize(round: Round, parentModalRef: bootstrap.Modal): void {
    this.round = round;
    this.parentModalRef = parentModalRef;

    const roundDetailRows: RoundDetailRow[] = []
    for (const gm of round.groupMembers ?? []) {
      const row = new RoundDetailRow();
      row.groupNumber = gm.groupNo;
      row.memberName = Util.Name.firstCommaLast(gm.member?.firstName, gm.member?.lastName);
      row.facilitator = gm.facilitator;
      row.email = gm.member?.email;
      roundDetailRows.push(row);
    }
    this.roundDetailRows = sortBy(roundDetailRows, r => r.groupNumber);

    const singupRows: SignupRow[] = [];
    for (const rs of round.roundSignups) {
      const row = new SignupRow();
      row.memberName = Util.Name.firstCommaLast(rs.member?.firstName, rs.member?.lastName);
      row.email = rs.member?.email;
      singupRows.push(row);
    }
    this.signupDetailsRows = sortBy(singupRows, r => r.memberName);

    this.createForm();
    this.updateFormFromModel();
  }
  
    updateFormFromModel(): void {
      this.roundForm.controls.groupSize.setValue(this.round.groupSize);
      console.log(this.round);
      this.roundForm.controls.dq1.setValue(this.round.dQ1);
      this.roundForm.controls.dq2.setValue(this.round.dQ2);
      this.roundForm.controls.dq3.setValue(this.round.dQ3);
      this.roundForm.controls.dq4.setValue(this.round.dQ4);
      this.roundForm.controls.dq5.setValue(this.round.dQ5);

      if (!isNil(this.round.endDate)) {
        this.roundForm.disable();
      }
    }

    getModelFromForm(): Round {
      const model = cloneDeep(this.round);
      model.groupMembers = [];
      model.roundSignups = [];
      model.roundTags = [];

      const values = this.roundForm.getRawValue();

      model.groupSize = values.groupSize;
      model.dQ1 = values.dq1;
      model.dQ2 = values.dq2;
      model.dQ3 = values.dq3;
      model.dQ4 = values.dq4;
      model.dQ5 = values.dq5;

      return model;
    }

  // button handlers

  onClickSave(): void {
    if (!this.canSave) {
      return;
    }

    const model = this.getModelFromForm();

    this.appService.incrementBusyCounter();
    this.dataService.updateRound(model).pipe(
      finalize(() => this.appService.decrementBusyCounter())
    ).subscribe({
      error: () => {
        window.alert('There was an error updating the Round!');
      },
      complete: () => {
        this.saved.emit();
        this.parentModalRef?.hide();
      }
    })
  }

  onClickClose(): void {
    this.parentModalRef?.hide();
  }

  // ui helpers

  get canSave(): boolean {
    return this.roundForm.valid && this.roundForm.enabled;
  }

  get tagsListString(): string {
     return orderBy(this.round.roundTags, rt => rt.tag?.name).map(rt => rt.tag?.name).join(", ")
  }
}

export class RoundDetailRow {
  groupNumber: number;
  memberName: string;
  facilitator: string;
  email: string;
}

export class SignupRow {
   memberName: string;
   email: string;
}

interface IFormModel {
  groupSize: FormControl<number>,
  dq1: FormControl<string>,
  dq2: FormControl<string>,
  dq3: FormControl<string>,
  dq4: FormControl<string>,
  dq5: FormControl<string>
}