import { Component, OnInit, ViewChild } from "@angular/core";
import * as bootstrap from "bootstrap"
import { isNil } from "lodash";

import { AuthService } from "../services/auth.service";
import { AppService } from "../services/app.service";
import { DataService } from "../services/data.service";

import { Round } from "../models/round.model";
import { OrgSummary } from "../models/org.model";
import { RoundDetailsComponent } from "./round-details.component";
import { RoundStartComponent } from "./round-start.component";

import * as Constant from '../core/constant';

@Component({
  selector: 'app-rounds',
  templateUrl: './round-list.component.html'
})
export class RoundListComponent implements OnInit {
  
  @ViewChild(RoundDetailsComponent)
  roundDetailsComponent: RoundDetailsComponent

  @ViewChild(RoundStartComponent)
  roundNewComponent: RoundStartComponent

  org: OrgSummary;
  rounds: Round[] = [];

  constructor(
    private authService: AuthService,
    private appService: AppService,
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    this.org = this.authService.getOrg();
    this.loadRounds()
  }

  // load data methods

  loadRounds(): void {
    this.appService.incrementBusyCounter();
    this.dataService.getAllRounds(this.org.orgID).subscribe({
      next: rounds => {
        this.appService.decrementBusyCounter();
        this.rounds = rounds
      },
      error: () => {
        this.appService.decrementBusyCounter();
        window.alert("There was an error loading Rounds!")
      }
    });
  }

  // button handlers

  onClickRoundDetails(round: Round): void {
    const modalRef = new bootstrap.Modal(Constant.Modal.roundDetails, {
      backdrop: 'static',
      keyboard: false
    });

    this.roundDetailsComponent.initialize(round.groupMembers, modalRef);

    modalRef.show();
  }

  onClickEndRound(round: Round): void {
    if (this.canEndRound(round)) {
      // check if round emails went out
      if (round.readyToSendNewRoundEmail === 'Y') {
        window.alert('Cannot end this Round because invitation emails have not been sent!  You can delete this Round instead.')
      } else {
        if (window.confirm('Are you sure you want to end this Round?')) {
          this.endRound(round.roundID);
        }
      }
    }
  }

  onClickDeleteRound(round: Round): void {
    if (window.confirm('Are you sure you want to delete this Round?')) {
      this.deleteRound(round.roundID);
    }
  }

  onClickStartRound(): void {
    if (this.rounds.some(r => isNil(r.endDate))) {
      window.alert('Cannot start new Round because there is an open Round!')
    } else {
      // if (window.confirm('Are you sure you want to start a new Round?')) {
      //   this.startRound();
      // }
      const modalRef = new bootstrap.Modal(Constant.Modal.roundStart, {
        backdrop: 'static',
        keyboard: false
      });

      this.roundNewComponent.initialize(modalRef);

      modalRef.show();
    }
  }

  // ui helpers 

  canEndRound(round: Round): boolean {
    return isNil(round.endDate);
  }

  getInvitationsSentStatus(round: Round): string {
    return round.readyToSendNewRoundEmail === 'Y'
      ? 'No'
      : 'Yes';
  }

  // private methods

  startRound(): void {
    this.appService.incrementBusyCounter();
    this.dataService.startRound(this.org.orgID, 3).subscribe({
      error: () => {
        this.appService.decrementBusyCounter();
        window.alert("There was an error starting a new Round!");
      },
      complete: () => {
        window.alert('Round successfully started!');
        this.appService.decrementBusyCounter();
        this.loadRounds();
      }
    });
  }

  endRound(roundID: number): void {
    if (!this.canEndRound) {
      window.alert('This Round has already ended!');
      return;
    }
    
    this.appService.incrementBusyCounter();
    this.dataService.endRound(roundID).subscribe({
      error: () => {
        this.appService.decrementBusyCounter();
        window.alert("There was an error ending the Round!");
      },
      complete: () => {
        window.alert('Round successfully ended!');
        this.appService.decrementBusyCounter();
        this.loadRounds();
      }
    });
  }

  deleteRound(roundID: number): void {
    this.appService.incrementBusyCounter();
    this.dataService.deleteRound(roundID).subscribe({
      error: () => {
        this.appService.decrementBusyCounter();
        window.alert("There was an error deleting the Round!");
      },
      complete: () => {
        window.alert('Round successfully deleted!');
        this.appService.decrementBusyCounter();
        this.loadRounds();
      }
    });
  }
}