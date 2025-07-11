import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";

import { Round } from "../models/round.model";
import { Member } from "../models/member.model";
import { StartRoundRequest } from "../requests/start-round.request";

import * as Util from '../core/util';
import { environment } from "../../environments/environment";
import { EmailRequest } from "../requests/email.request";
import { observableToBeFn } from "rxjs/internal/testing/TestScheduler";
import { RoundSignupRequest } from "../requests/round-signup.request";
import { Tag } from "../models/tag.model";
import { isEmpty, orderBy } from "lodash";


@Injectable({
  providedIn: "root"
})
export class DataService {

  constructor(
    private http: HttpClient
  ) {}

  // members

  getAllMembers(orgId: number): Observable<Member[]> {
    const url = environment.webApiBaseUrl +'member';
    const params = {
      orgId
    };
    return this.http.get<Member[]>(url, { params }).pipe(
      tap(members => {
        for (const member of members) {
          member.displayName = Util.Name.firstCommaLast(member.firstName, member.lastName);
          if (!isEmpty(member.memberTags)) {
            member.tagsString = orderBy(member.memberTags, mt => mt.tag?.name).map(mt => mt.tag?.name).join(", ")
          }
        }
      })
    )
  }

  createMember(member: Member): Observable<Member> {
    const url = environment.webApiBaseUrl + 'member';
    return this.http.post<Member>(url, member);
  }

  updateMember(member: Member): Observable<Member> {
    const url = environment.webApiBaseUrl + 'member';
    return this.http.put<Member>(url, member);
  }

  deleteMember(memberID: number): Observable<void> {
    const url = environment.webApiBaseUrl + 'member/' + memberID.toString();
    return this.http.delete<void>(url);
  }

  sendMemberEmail(request: EmailRequest): Observable<void> {
    const url = environment.webApiBaseUrl + 'member/sendemail';
    return this.http.post<void>(url, request);
  }

  // rounds

  getAllRounds(orgId: number): Observable<Round[]> {
    const url = environment.webApiBaseUrl +'round';
    const params = {
      orgId
    };
    return this.http.get<Round[]>(url, { params }).pipe(
      tap(rounds => {
        for (const round of rounds) {
          if (!isEmpty(round.roundTags)) {
            round.tagsString = orderBy(round.roundTags, rt => rt.tag?.name).map(tr => tr.tag?.name).join(", ");
          }
        }
      })
    )
  }

  getActiveRound(orgID: number): Observable<Round> {
    const url = environment.webApiBaseUrl + 'round/active';
    const params = {
      orgID
    };
    return this.http.get<Round>(url, { params });
  }

  getRoundByID(roundID: number): Observable<Round> {
    const url = environment.webApiBaseUrl + 'round/' + roundID.toString();
    return this.http.get<Round>(url);
  }
  
  startRound(request: StartRoundRequest): Observable<void> {
    const url = environment.webApiBaseUrl +'round/start'
    return this.http.post<void>(url, request);
  }

  updateRound(round: Round): Observable<Round> {
    const url = environment.webApiBaseUrl +'round'
    return this.http.put<Round>(url, round);
  }

  endRound(roundID: number): Observable<void> {
    const url = environment.webApiBaseUrl +'round/' + roundID.toString() + '/end'
    return this.http.post<void>(url, {});
  }

  deleteRound(roundID: number): Observable<void> {
    const url = environment.webApiBaseUrl + 'round/' + roundID.toString();
    return this.http.delete<void>(url);
  }

  signupMultipleForRound(request: RoundSignupRequest): Observable<any> {
    const url = environment.webApiBaseUrl + 'round/signupmultiple';
    return this.http.post(url, request);
  }

  // tags

  getAllTags(orgId: number): Observable<Tag[]> {
    const url = environment.webApiBaseUrl +'tag';
    const params = {
      orgId
    };
    return this.http.get<Tag[]>(url, { params });
  }

  createTag(tag: Tag): Observable<Tag> {
    const url = environment.webApiBaseUrl + 'tag';
    return this.http.post<Tag>(url, tag);
  }

  updateTag(tag: Tag): Observable<Tag> {
    const url = environment.webApiBaseUrl + 'tag';
    return this.http.put<Tag>(url, tag);
  }

  deleteTag(tagID: number): Observable<void> {
    const url = environment.webApiBaseUrl + 'tag/' + tagID.toString();
    return this.http.delete<void>(url);
  }
}