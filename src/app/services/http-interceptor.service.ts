import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {

  constructor() { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('API Request:', request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body
    });

    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          console.log('API Response:', request.url, {
            status: event.status,
            body: event.body
          });
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('API Error:', request.url, {
          status: error.status,
          statusText: error.statusText,
          error: error.error
        });
        return throwError(() => error);
      })
    );
  }
} 