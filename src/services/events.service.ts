import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventsService {

  private leftNavOpen = new Subject<boolean>();
  leftNavOpen$ = this.leftNavOpen.asObservable();

  constructor() { }

  LeftNavOpenEvent(event: boolean) {
    this.leftNavOpen.next(event);
  }

}
