import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { LoginRequest } from 'src/models/request/login-request.model';
import { BaseResponse } from 'src/models/response/base-response.model';
import { LoginResponse } from 'src/models/response/login-response.model';
import { LogoutResponse } from 'src/models/response/logout-response.model';
import { HttpHeader } from 'src/utils/http-header.enum';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  baseUrl: string;

  constructor(public _http: HttpClient) {
    this.baseUrl = environment.endpoint;
  }

  SetAuthToken(token: string) {
    localStorage.setItem(HttpHeader.Authorization, token);
  }
  GetAuthToken() {
    return localStorage.getItem(HttpHeader.Authorization);
  }
  RemoveAuthToken() {
    localStorage.removeItem(HttpHeader.Authorization);
  }

  RequestLogin(payload: LoginRequest) {
    return this._http.post<BaseResponse<LoginResponse>>(`${this.baseUrl}/api/Authentication/Login`, payload);
  }
  RequestLogout() {
    return this._http.get<BaseResponse<LogoutResponse>>(`${this.baseUrl}/api/Authentication/Logout`);
  }

  ClearAppData(){
    localStorage.clear();
  }
}
