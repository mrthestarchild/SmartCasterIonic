import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { SettingValue } from 'src/models/response/setting-value.model';
import { BaseResponse } from 'src/models/response/base-response.model';

@Injectable({
  providedIn: 'root'
})
export class UserSettingsService {

  baseUrl: string;

  constructor(public _http: HttpClient) {
    this.baseUrl = environment.endpoint;
  }

  GetUserSettings(){
    return this._http.get<Map<string, SettingValue>>(`${this.baseUrl}/api/UserSettings/GetUserSettings`);
  }

  AddUpdateUserSettings(payload: Map<string, SettingValue>){
    return this._http.put<BaseResponse<Map<string, SettingValue>>>(`${this.baseUrl}/api/UserSettings/AddUpdateUserSettings`, payload);
  }
}
