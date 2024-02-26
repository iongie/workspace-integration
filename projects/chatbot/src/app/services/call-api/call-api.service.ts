import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CallApiService {

  constructor(
    private http: HttpClient
  ) { }

  postChat(param: any, data: any, apiKey: string, userId: string, id: string) {
    return this.http.post(environment.api + param, data, {
      headers: new HttpHeaders()
        .set('x-api-key', apiKey)
        .set('user-id', userId)
        .set('id', id)
    }).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  getChat(param: string, apiKey: string, userId: string, id: string) {
    return this.http.get(environment.api + param, {
      headers: new HttpHeaders()
        .set('x-api-key', apiKey)
        .set('user-id', userId)
        .set('id', id)
    }).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  createUser(param: any, data: any, apiKey?: string) {
    const cekToken = apiKey !== undefined ? { headers: new HttpHeaders().set('x-api-key', apiKey) } : undefined
    return this.http.post(environment.api + param, data, cekToken).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  uploadFile(param: any, data: any, apiKey: string) {
    return this.http.post(environment.api + param, data, {
      headers: new HttpHeaders()
        .set('x-api-key', apiKey)
    }).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  generalPost(param: any, data: any, apiKey: string) {
    return this.http.post(environment.api + param, data, {
      headers: new HttpHeaders()
        .set('x-api-key', apiKey)
    }).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }
  
}
