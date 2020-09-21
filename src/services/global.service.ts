import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BaseResponse } from 'src/models/response/base-response.model';
import { FileTypeListResponse } from 'src/models/file-type-list-response.model';
import { SpotCollectionResponse } from 'src/models/response/spot-collection-response.model';
import { SpotCollectionRequest } from 'src/models/request/spot-collection-request.model';
import { SpotResponse } from 'src/models/response/spot-response.model';
import { SpotRequest } from 'src/models/request/spot-request.model';
import { SessionIdentifiers } from 'src/utils/session-identifiers.enum';
import { StatusCode } from 'src/utils/status-code.enum';
import * as moment from 'moment';


@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  private isLoggedIn = new Subject<boolean>();
  isLoggedIn$ = this.isLoggedIn.asObservable();

  private userTheme = new Subject<string>();
  userTheme$ = this.userTheme.asObservable();

  _http: HttpClient;
  baseUrl: string;

  constructor(private http: HttpClient) {
    this._http = this.http;
    this.baseUrl = environment.endpoint;
  }

  LogInUser(userAction: boolean) {
    localStorage.setItem(SessionIdentifiers.UserLoggedIn, JSON.stringify(userAction));
    this.isLoggedIn.next(userAction);
  }
  CheckUserLoggedIn() {
    return JSON.parse(localStorage.getItem(SessionIdentifiers.UserLoggedIn));
  }

  SetRememberUsername(userAction: string) {
    localStorage.setItem(SessionIdentifiers.UserLoginName, JSON.stringify(userAction));
  }
  UnsetRememberUsername() {
    localStorage.removeItem(SessionIdentifiers.UserLoginName);
  }
  GetRememberUsername() {
    return localStorage.getItem(SessionIdentifiers.UserLoginName);
  }

  SetUserThemePreference(theme: string){
    localStorage.setItem(SessionIdentifiers.UserTheme, theme);
    this.userTheme.next(theme);
  }
  GetUserThemePreference(){
    return localStorage.getItem(SessionIdentifiers.UserTheme);
  }

  SetImageFileTypes(){
    let imageFileTypes = this._http.get<BaseResponse<FileTypeListResponse>>(`${this.baseUrl}/api/FileTypes/GetImageFileTypes`).subscribe(response =>{
      if(response.StatusCode == StatusCode.Success){
        localStorage.setItem(SessionIdentifiers.ImageFileTypes, JSON.stringify(response.Data));
      }
      else {
        localStorage.setItem(SessionIdentifiers.ImageFileTypes, "");
      }
    });
    return imageFileTypes;
  }
  GetImageFileTypes(): FileTypeListResponse{
    let fileTypes = localStorage.getItem(SessionIdentifiers.ImageFileTypes);
    let parsedResponse = null;
    if(fileTypes){
      parsedResponse = JSON.parse(parsedResponse);
    }
    // console.log(parsedResponse);
    return parsedResponse;
    // return JSON.parse(localStorage.getString(SessionIdentifiers.ImageFileTypes));
  }
  SetAudioFileTypes(){
    let audioFileTypes = this._http.get<BaseResponse<FileTypeListResponse>>(`${this.baseUrl}/api/FileTypes/GetAudioFileTypes`).subscribe(response =>{
      if(response.StatusCode == StatusCode.Success){
        localStorage.setItem(SessionIdentifiers.AudioFileTypes, JSON.stringify(response.Data));
      }
      else {
        localStorage.setItem(SessionIdentifiers.AudioFileTypes, "");
      }
    });
    return audioFileTypes;
  }
  GetAudioFileTypes(): FileTypeListResponse{
    let fileTypes = localStorage.getItem(SessionIdentifiers.AudioFileTypes);
    let parsedResponse = null;
    if(fileTypes){
      parsedResponse = JSON.parse(fileTypes);
    }
    // console.log(parsedResponse);
    return parsedResponse;
    // return JSON.parse(localStorage.getString(SessionIdentifiers.AudioFileTypes));
  }
}
