import { Component, OnInit, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { finalize } from "rxjs";
import { cloneDeep, sortBy } from "lodash";
import * as bootstrap from "bootstrap"

import { AuthService } from "../services/auth.service";
import { AppService } from "../services/app.service";
import { DataService } from "../services/data.service";

import { OrgSummary } from "../models/org.model";
import { Tag } from "../models/tag.model";
import { TagDetailsComponent } from "./tag-details.component";

import * as Constant from '../core/constant';

@Component({
  selector: 'app-tags',
  templateUrl: './tag-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    TagDetailsComponent
  ]
})
export class TagListComponent implements OnInit {

  @ViewChild(TagDetailsComponent)
  tagDetailsComponent: TagDetailsComponent;

  org: OrgSummary;
  tags: Tag[] = [];

  constructor(
    private authService: AuthService,
    private appService: AppService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.org = this.authService.getOrg();
    this.loadTags();
  }

  // load data methods

  loadTags(): void {
    this.appService.incrementBusyCounter();
    this.dataService.getAllTags(this.org.orgID).pipe(
      finalize(() => this.appService.decrementBusyCounter())
    ).subscribe({
      next: tags => {
        this.tags = sortBy(tags, t => t.name);
      },
      error: () => {
        window.alert("There was an error loading Tags!")
      }
    });
  }

  // button handlers

  onClickNewTag(): void {
    const tag = new Tag()
    tag.id = 0;
    tag.orgID = this.org.orgID;

    const modalRef = new bootstrap.Modal(Constant.Modal.tagDetails, {
      backdrop: 'static',
      keyboard: false
    });

    this.tagDetailsComponent.initialize(tag, true, this.tags, modalRef)

    modalRef.show();
  }

  onClickTagDetails(tag: Tag): void {
    const tagClone = cloneDeep(tag);

    const modalRef = new bootstrap.Modal(Constant.Modal.tagDetails, {
      backdrop: 'static',
      keyboard: false
    });
    
    this.tagDetailsComponent.initialize(tagClone, false, this.tags, modalRef)

    modalRef.show();
  }

  onClickDeleteTag(tag: Tag): void {
    if (window.confirm('Are you sure you want to delete this Tag?')) {
      this.deleteTag(tag.id);
    }  
  }

  // private methods

  deleteTag(tagID: number): void {
    this.appService.incrementBusyCounter();
    this.dataService.deleteTag(tagID).pipe(
      finalize(() => this.appService.decrementBusyCounter())
    ).subscribe({
      error: () => {
        window.alert("There was an error deleting the Tag!");
      },
      complete: () => {
        window.alert('Tag successfully deleted!');
        this.loadTags();
      }
    });
  }
}