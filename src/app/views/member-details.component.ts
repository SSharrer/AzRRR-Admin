import { AfterViewInit, Component, EventEmitter, OnInit, Output } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import * as bootstrap from "bootstrap"

import { DataService } from "../services/data.service";
import { AppService } from "../services/app.service";

import { Member } from "../models/member.model";
import { cloneDeep, isEmpty } from "lodash";
import { finalize } from "rxjs";
import { Tag } from "../models/tag.model";
import { TagSelector } from "../models/tag-selector.model";
import { MemberTag } from "../models/member-tag.model";

@Component({
  selector: 'app-member-details',
  templateUrl: './member-details.component.html'
})
export class MemberDetailsComponent implements OnInit, AfterViewInit {

  @Output()
  saved = new EventEmitter<void>();

  member: Member;
  isNew: boolean;
  parentModalRef: bootstrap.Modal;
  tags: Tag[] = [];
  tagSelectors: TagSelector[] = [];

  memberForm: FormGroup<IFormModel>;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private appService: AppService
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  ngAfterViewInit(): void {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl));
  }

  initialize(member: Member, isNew: boolean, tags: Tag[], parentModalRef: bootstrap.Modal): void {
    this.member = member;
    this.isNew = isNew;
    this.tags = tags ?? [];
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
      autoEnrollInNewRounds: new FormControl<boolean>(true),
    });
  }

  updateFormFromModel(): void {
    this.memberForm.controls.firstName.setValue(this.member.firstName);
    this.memberForm.controls.lastName.setValue(this.member.lastName);
    this.memberForm.controls.phone.setValue(this.member.phone);
    this.memberForm.controls.email.setValue(this.member.email);
    this.memberForm.controls.autoEnrollInNewRounds.setValue(this.member.autoEnrollInNewRounds);

    this.tagSelectors = [];
    for (const tag of this.tags) {
      const tagSelector = new TagSelector();
      tagSelector.tagID = tag.id;
      tagSelector.tagName = tag.name;
      tagSelector.selected = this.member.memberTags?.some(mt => mt.tagID === tag.id) ?? false;
      this.tagSelectors.push(tagSelector);
    }
    console.log(this.tagSelectors);
  }

  getModelFromForm(): Member {
    const model = cloneDeep(this.member);

    model.firstName = this.memberForm.controls.firstName.value;
    model.lastName = this.memberForm.controls.lastName.value;
    model.phone = this.memberForm.controls.phone.value;
    model.email = this.memberForm.controls.email.value;
    model.autoEnrollInNewRounds = this.memberForm.controls.autoEnrollInNewRounds.value;

    model.memberTags = [];
    for (const tagSelector of this.tagSelectors.filter(s => s.selected)) {
      const memberTag = new MemberTag();
      memberTag.id = 0;
      memberTag.memberID = this.member.memberID;
      memberTag.tagID = tagSelector.tagID;
      model.memberTags.push(memberTag);
    }

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

  onClickTag(item: TagSelector): void {
    item.selected = !item.selected;
  }

  // ui helpers

  get selectedtagCount(): number {
    return !isEmpty(this.tagSelectors)
    ? this.tagSelectors.filter(t => t.selected).length
    : 0;
  }
}

interface IFormModel {
  lastName: FormControl<string>,
  firstName: FormControl<string>,
  phone: FormControl<string>,
  email: FormControl<string>,
  autoEnrollInNewRounds: FormControl<boolean>;
}
