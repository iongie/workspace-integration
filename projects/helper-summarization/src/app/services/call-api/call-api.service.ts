import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class CallApiService {

  constructor(
    private http: HttpClient
  ) { }

  postSummarization(param: any, data: any) {
    return this.http.post(environment.api + param, data)
    .pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }
}
