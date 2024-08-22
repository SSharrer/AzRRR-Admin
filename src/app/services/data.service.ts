import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";

import { Round } from "../models/round.model";

import { Member } from "../models/member.model";

import * as Util from '../core/util';
import { environment } from "../../environments/environment";

@Injectable()
export class DataService {

  constructor(
    private http: HttpClient
  ) {}

  // rounds

  getAllRounds(orgId: number): Observable<Round[]> {
    const url = environment.webApiBaseUrl +'round';
    const params = {
      orgId
    };
    return this.http.get<Round[]>(url, { params });
  }

  startRound(orgID: number, groupSize: number): Observable<void> {
    const url = environment.webApiBaseUrl +'round/start'
    const request = {
      orgID,
      groupSize
    }
    return this.http.post<void>(url, request);
  }

  endRound(roundID: number): Observable<void> {
    const url = environment.webApiBaseUrl +'round/' + roundID.toString() + '/end'
    return this.http.post<void>(url, {});
  }

  deleteRound(roundID: number): Observable<void> {
    const url = environment.webApiBaseUrl + 'round/' + roundID.toString();
    return this.http.delete<void>(url);
  }

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
}