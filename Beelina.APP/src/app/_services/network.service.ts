import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  isOnline = new BehaviorSubject<boolean>(navigator.onLine);

  constructor() { }

}
