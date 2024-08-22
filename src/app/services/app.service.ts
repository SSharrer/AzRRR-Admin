import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable()
export class AppService {

  private _busyCount: number = 0;
  private _busyCountSubject = new Subject<number>();
  busyCount$ = this._busyCountSubject.asObservable();
  
  incrementBusyCounter(): void {
    this._busyCount += 1;
    this._busyCountSubject.next(this._busyCount);
  }

  decrementBusyCounter(): void {
    if (this._busyCount >= 1) {
      this._busyCount -= 1;
    }
    this._busyCountSubject.next(this._busyCount);
  }
}