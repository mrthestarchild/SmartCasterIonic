import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpHeaders,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/services/authentication.service';
import { HttpHeader } from 'src/utils/http-header.enum';
import { Constants } from 'src/utils/constants';
import { environment } from 'src/environments/environment';


@Injectable()
export class SmartCasterInterceptor implements HttpInterceptor {

  constructor(public authService: AuthenticationService,
              private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let newRequest;
    const authToken = this.authService.GetAuthToken();
    if (request.url.indexOf('api/Authentication/Login') > -1 ||
        request.url.indexOf('api/FileTypes') > -1 ||
        authToken == null || 
        authToken == undefined || 
        authToken == '') {
      newRequest = this.RequestWithoutJwt(request);
    } else {
      newRequest = this.RequestWithJwt(request);
    }
    return next.handle(newRequest).pipe(tap((event) => {
      if (event instanceof HttpResponse) {
        if (event.headers.get(HttpHeader.Authorization)) {
          this.SetAuthToken(event);
        }
      }
    }, (error: HttpErrorResponse) => {
      if (error.status === 401) {
        // TODO: do error handling for unauthorized
        setTimeout(() =>{
          this.router.navigateByUrl('/home');
        },100);
      }
      if (error.status === 500) {
        // TODO: do error handling for server error.
      }
    },
    () => {
      // always runs
      console.log('completed successfully');
    }
    ));
  }

  SetAuthToken(event: HttpResponse<any>) {
    const authHeader = event.headers.get(HttpHeader.Authorization);
    const authToken = authHeader.replace(Constants.Bearer, '');
    this.authService.SetAuthToken(authToken);
  }

  RequestWithoutJwt(request: HttpRequest<any>) {
    return request.clone({
      headers: new HttpHeaders ({
        'Content-Type':  'application/json',
        AppToken: `${environment.apptoken}`
      })
    });
  }

  RequestWithJwt(request: HttpRequest<any>) {
    let authToken = this.authService.GetAuthToken();
    return request.clone({
      headers: new HttpHeaders ({
        'Content-Type':  'application/json',
        AppToken: `${environment.apptoken}`,
        Authorization: `${Constants.Bearer + authToken}`
      }), withCredentials: false
    });
  }

}
