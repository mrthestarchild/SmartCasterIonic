import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';
import { LoginResponse } from 'src/models/response/login-response.model';
import { environment } from 'src/environments/environment';
import { CreateUserAccountRequest } from 'src/models/request/create-user-account-request.model';
import { BaseResponse } from 'src/models/response/base-response.model';
import { CreateUserAccountResponse } from 'src/models/response/create-user-account-response.model';
import { UserAccountInfoResponse } from 'src/models/response/user-account-info-response.model';
import { UpdateUserAccountInfoRequest } from 'src/models/request/update-user-account-info-request.model';
import { SessionIdentifiers } from 'src/utils/session-identifiers.enum';

@Injectable({
  providedIn: 'root'
})
export class UserAccountService {

  baseUrl: string;
  _http: HttpClient;

  private userInfo = new Subject<LoginResponse>();
  userInfo$ = this.userInfo.asObservable();

  constructor(http: HttpClient) {
    this.baseUrl = environment.endpoint;
    this._http = http;
  }

  CreateUserAccount(payload: CreateUserAccountRequest): Observable<BaseResponse<CreateUserAccountResponse>> {
    return this._http.put<BaseResponse<CreateUserAccountResponse>>(`${this.baseUrl}/api/Account/CreateUserAccount`, payload);
  }

  GetUserAccountInfo(): Observable<BaseResponse<UserAccountInfoResponse>> {
    return this._http.get<BaseResponse<UserAccountInfoResponse>>(`${this.baseUrl}/api/Account/GetUserAccountInfo`);
  }

  UpdateUserAccount(payload: UpdateUserAccountInfoRequest): Observable<BaseResponse<UserAccountInfoResponse>> {
    return this._http.put<BaseResponse<UserAccountInfoResponse>>(`${this.baseUrl}/api/Account/UpdateUserAccountInfo`, payload);
  }

  SaveUserAccountInfo(payload: LoginResponse) {
    this.userInfo.next(payload);
    localStorage.setItem(SessionIdentifiers.UserAccoutInfo, JSON.stringify(payload));
  }

  GetSavedUserAccountInfo(): LoginResponse {
    return JSON.parse(localStorage.getItem(SessionIdentifiers.UserAccoutInfo));
  }
}
