import { AfterViewInit, Component, EventEmitter, OnInit, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import * as bootstrap from "bootstrap"
import { isEmpty } from "lodash";

import { AuthService } from "../services/auth.service";
import { DataService } from "../services/data.service";
import { AppService } from "../services/app.service";

import { OrgSummary } from "../models/org.model";
import { StartRoundRequest } from "../requests/start-round.request";
import { Tag } from "../models/tag.model";
import { TagSelector } from "../models/tag-selector.model";

@Component({
  selector: 'app-round-start',
  templateUrl: './round-start.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class RoundStartComponent implements OnInit, AfterViewInit {

  @Output()
  saved = new EventEmitter<void>();
  
  parentModalRef: bootstrap.Modal;
  
  org: OrgSummary;
  startDate = new Date();
  tagSelectors: TagSelector[] = [];

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

  ngAfterViewInit(): void {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl));
  }

  initialize(tags: Tag[], parentModdalRef: bootstrap.Modal): void {
    this.parentModalRef = parentModdalRef;

    this.tagSelectors = [];
    for (const tag of tags ?? []) {
      const tagSelector = new TagSelector();
      tagSelector.tagID = tag.id;
      tagSelector.tagName = tag.name;
      tagSelector.selected = false;
      this.tagSelectors.push(tagSelector);
    }

    this.createForm();
  }

  createForm(): void {
    this.roundForm = this.fb.group<IFormModel>({
      groupSize: new FormControl<number>(3, [ Validators.required ]),
      dq1: new FormControl<string>(null),
      dq2: new FormControl<string>(null),
      dq3: new FormControl<string>(null),
      dq4: new FormControl<string>(null),
      dq5: new FormControl<string>(null)
    });
  }

  // button handlers

  onClickStart(): void {
    if (this.roundForm.valid) {
      const request = this.buildRequest();
      this.appService.incrementBusyCounter();
      this.dataService.startRound(request).subscribe({
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

  onClickTag(item: TagSelector): void {
    item.selected = !item.selected;
  }

  // ui helpers

  get selectedtagCount(): number {
    return !isEmpty(this.tagSelectors)
    ? this.tagSelectors.filter(t => t.selected).length
    : 0;
  }

  // private methods

  buildRequest(): StartRoundRequest {
    const request = new StartRoundRequest()
    const values = this.roundForm.getRawValue();

    request.orgID = this.org.orgID;
    request.groupSize = values.groupSize;

    if (values.dq1) {
      request.dq1 = values.dq1;
    }

    if (values.dq2) {
      request.dq2 = values.dq2;
    }

    if (values.dq3) {
      request.dq3 = values.dq3;
    }

    if (values.dq4) {
      request.dq4 = values.dq4;
    }

    if (values.dq5) {
      request.dq5 = values.dq5;
    }

    request.tagIDs = this.tagSelectors.filter(t => t.selected).map(t => t.tagID) ?? [];

    return request;
  }

}

interface IFormModel {
  groupSize: FormControl<number>,
  dq1: FormControl<string>,
  dq2: FormControl<string>,
  dq3: FormControl<string>,
  dq4: FormControl<string>,
  dq5: FormControl<string>
}