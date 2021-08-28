import { Component, OnInit } from '@angular/core';
import { LoginResponse } from 'src/models/response/login-response.model';
import { UserAccountService } from 'src/services/account.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {

  userInfo: LoginResponse;
  selectedThemeSetting: boolean;
  selectedWebHistory: boolean;

  constructor(private _userAccountService: UserAccountService) {
    this._userAccountService.userInfo$.subscribe(result =>{
      this.userInfo = result;
    });
    if(!this.userInfo){
      this.userInfo = this._userAccountService.GetSavedUserAccountInfo();
      this.selectedThemeSetting = this.userInfo.UserSettings['SelectedTheme'].Value == 'dark';
      this.selectedWebHistory = this.userInfo.UserSettings['SaveWebHistory'].Value;
    }
  }

  ngOnInit() {}

  /**
   * Saves settings for the user and submits them to the database
   */
  SaveSettings() {
    // TODO: save settings here.
  }

}
