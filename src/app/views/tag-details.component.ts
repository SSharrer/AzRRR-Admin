import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { finalize } from "rxjs";
import { cloneDeep } from "lodash";

import { DataService } from "../services/data.service";
import { AppService } from "../services/app.service";

import { Tag } from "../models/tag.model";

@Component({
  selector: 'app-tag-details',
  templateUrl: './tag-details.component.html'
})
export class TagDetailsComponent implements OnInit {
  
  @Output()
  saved = new EventEmitter<void>();

  tag: Tag;
  allTags: Tag[] = [];
  isNew: boolean;
  parentModalRef: bootstrap.Modal;

  tagForm: FormGroup<IFormModel>
  
  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private appService: AppService
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  initialize(tag: Tag, isNew: boolean, allTags: Tag[], parentModalRef: bootstrap.Modal): void {
    this.tag = tag;
    this.isNew = isNew;
    this.allTags = allTags;
    this.parentModalRef = parentModalRef;

    this.createForm();
    this.updateFormFromModel();
  }

  createForm(): void {
    this.tagForm = this.fb.group<IFormModel>({
      name: new FormControl<string>(null, [Validators.required])
    });
  }

  updateFormFromModel(): void {
    this.tagForm.controls.name.setValue(this.tag.name);
  }

  getModelFromForm(): Tag {
    const model = cloneDeep(this.tag);
    model.name = this.tagForm.controls.name.value;
    return model;
  }


  // button handlers

  onClickSave(): void {
    if (!this.canSave) {
      return;
    }

    const model = this.getModelFromForm();

    const isDup = this.isNew 
    ? this.allTags.some(t => t.name.toUpperCase() === model.name.toUpperCase())
    : this.allTags.some(t => t.id !== model.id && t.name.toUpperCase() === model.name.toUpperCase());
    
    if (isDup) {
      window.alert('Duplicate Tag Name!')
      return;
    }

    const save$ = this.isNew
    ? this.dataService.createTag(model)
    : this.dataService.updateTag(model);

    this.appService.incrementBusyCounter()
    save$.pipe(
      finalize(() => this.appService.decrementBusyCounter())
    ).subscribe({
      error: () => {
        window.alert('There was an error saving the Tag!')
      },
      complete: () => {
        this.saved.emit();
        this.parentModalRef?.hide();
      }
    })
  }

  onClickCancel(): void {
    this.parentModalRef?.hide();
  }

  // ui helpers

  get canSave(): boolean {
    return this.tagForm.valid;
  }
}

interface IFormModel {
  name: FormControl<string>,
}
