import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _isLoading = new BehaviorSubject<boolean>(false);
  readonly isLoading$ = this._isLoading.asObservable();

  set isLoading(value: boolean) {
    this._isLoading.next(value);
  }

  get isLoading(): boolean {
    return this._isLoading.value;
  }
}
