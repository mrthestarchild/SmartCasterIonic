import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { SettingValue } from 'src/models/response/setting-value.model';
import { BaseResponse } from 'src/models/response/base-response.model';

@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {

  _http: HttpClient;
  baseUrl: string;

  constructor(private http: HttpClient) {
    this._http = this.http;
    this.baseUrl = environment.endpoint;
  }

  GetUserSettings(){
    return this._http.get<Map<string, SettingValue>>(`${this.baseUrl}/api/UserSettings/GetUserSettings`);
  }

  AddUpdateUserSettings(payload: Map<string, SettingValue>){
    return this._http.put<BaseResponse<Map<string, SettingValue>>>(`${this.baseUrl}/api/UserSettings/AddUpdateUserSettings`, payload);
  }
}
