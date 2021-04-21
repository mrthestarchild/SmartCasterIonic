import { Component, OnInit, Output, EventEmitter, ElementRef, Host, NgZone } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { LoginRequest } from 'src/models/request/login-request.model';
import { AuthenticationService } from 'src/services/authentication.service';
import { UserAccountService } from 'src/services/account.service';
import { GlobalService } from 'src/services/global.service';
import { Router } from '@angular/router';
import { StatusCode } from 'src/utils/status-code.enum';
import { SessionIdentifiers } from 'src/utils/session-identifiers.enum';
import { LoginResponse } from 'src/models/response/login-response.model';
import { FileSystemService } from 'src/services/file-system.service';
import { HomePage } from '../home/home.page';
import { CommercialPlayerService } from 'src/services/commercial-player.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  _homePage: HomePage;

  @Output() isLoggedIn = new EventEmitter<boolean>();
  loginForm: FormGroup;
  payload: LoginRequest;

  showError: boolean = false;
  errorText: string = '';
  loginLoading: boolean = false;

  constructor(private _authService: AuthenticationService,
              private _userAccountService: UserAccountService,
              private _globalService: GlobalService,
              private _router: Router,
              private _fb: FormBuilder,
              private _fileService: FileSystemService,
              private _commercialService: CommercialPlayerService,
              @Host() homePage: HomePage) {
    this._homePage = homePage;
              }

  ngOnInit(): void {
    this.loginForm = this._fb.group({
      username: ['', [Validators.required, Validators.minLength(1)]],
      password: ['' , [Validators.required, Validators.minLength(8)]],
      rememberUser: [false]
    });
    let savedUsername = this._globalService.GetRememberUsername();
    if(savedUsername){
      this.loginForm.controls.username.setValue(savedUsername);
      this.loginForm.controls.rememberUser.setValue(true);
    }
  }

  ClearFormStatus() {
    this.showError = false;
    this.errorText = '';
  }

  SubmitLogin() {
    this._homePage.showMainLoading = true;
    this.loginLoading = true;
    this.ClearFormStatus();

    this.payload = new LoginRequest();
    this.payload.Username = this.loginForm.controls.username.value;
    this.payload.Password = this.loginForm.controls.password.value;
    if(this.loginForm.controls.rememberUser.value == true){
      this._globalService.SetRememberUsername(this.loginForm.controls.username.value);
      localStorage.setItem(SessionIdentifiers.UserLoginName, this.loginForm.controls.username.value);
    }
    else{
      this._globalService.UnsetRememberUsername();
    }

    this._authService.RequestLogin(this.payload).subscribe(async result => {
      if (result.StatusCode === StatusCode.Success) {
        // this._userAccountService.SaveUserAccountInfo(result.Data);
        let userInfo = await this.InitApplication(result.Data);
        this._userAccountService.SaveUserAccountInfo(userInfo);
        console.log(userInfo);
        this._commercialService.SetCommercial(userInfo.SpotCollections[0]);
        this._globalService.LogInUser(true);
        this.loginForm.reset();
        this.loginLoading = false;
        this._homePage.showMainLoading = false;
        this._router.navigateByUrl('/main-navigation');
      } else if (result.StatusCode === StatusCode.UserNotFound || result.StatusCode === StatusCode.InvalidPassword) {
        this.showError = true;
        this.errorText = result.StatusMessage;
        this.loginLoading = false;
        this._homePage.showMainLoading = false;
      }
      else{
        this.showError = true;
        this.errorText = result.StatusMessage;
        this.loginLoading = false;
        this._homePage.showMainLoading = false;
      }
    },((error: any)=>{
      console.error(error);
      this.showError = true;
      this.errorText = "An unknown Error occured";
      this.loginLoading = false;
      this._homePage.showMainLoading = false;
      })
    );
  }

  InitApplication(userInfo: LoginResponse): Promise<LoginResponse>{
    return new Promise(async (resolve, reject) => {
        this._homePage.loadingInfoMessage = "Checking File System paths";
        userInfo.Spots = await this._fileService.ValidateSpotListUri(userInfo.Spots);
        this._homePage.loadingInfoMessage = "Checking Commercials";
        for(let x = 0; x < userInfo.SpotCollections.length; x++){
          userInfo.SpotCollections[x].SpotList = await this._fileService.ValidateSpotListUri(userInfo.SpotCollections[x].SpotList);
        }
        this._homePage.loadingInfoMessage = "Checking Pads";
        for(let x = 0; x < userInfo.PadCollections.length; x++){
          userInfo.PadCollections[x].SpotList = await this._fileService.ValidateSpotListUri(userInfo.PadCollections[x].SpotList);
        }
        resolve(userInfo);
    });
  }

  GoToNext(element){
    console.log(typeof(element))
    element.setFocus();
  }
}
