import { Component, OnInit } from '@angular/core';
import { LoginResponse } from 'src/models/response/login-response.model';
import { UserAccountService } from 'src/services/account.service';
import { SessionIdentifiers } from 'src/utils/session-identifiers.enum';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {

  userInfo: LoginResponse;
  selectedThemeSetting: boolean;

  constructor(private _userAccountService: UserAccountService) {
    this._userAccountService.userInfo$.subscribe(result =>{
      this.userInfo = result;
    });
    if(!this.userInfo){
      this.userInfo = this._userAccountService.GetSavedUserAccountInfo();
    }
  }

  ngOnInit() {

  }

}
