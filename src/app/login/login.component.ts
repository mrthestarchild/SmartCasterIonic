import { Component, OnInit, Output, EventEmitter, ElementRef } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { LoginRequest } from 'src/models/request/login-request.model';
import { AuthenticationService } from 'src/services/authentication.service';
import { UserAccountService } from 'src/services/account.service';
import { GlobalService } from 'src/services/global.service';
import { Router } from '@angular/router';
import { StatusCode } from 'src/utils/status-code.enum';
import { SessionIdentifiers } from 'src/utils/session-identifiers.enum';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

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
              private _fb: FormBuilder) {
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

    this._authService.RequestLogin(this.payload).subscribe(result => {
      if (result.StatusCode === StatusCode.Success) {
        this._userAccountService.SaveUserAccountInfo(result.Data);
        this._globalService.LogInUser(true);
        this.loginForm.reset();
        this.loginLoading = false;
        this._router.navigateByUrl('/main-navigation');
      } else if (result.StatusCode === StatusCode.UserNotFound || result.StatusCode === StatusCode.InvalidPassword) {
        this.showError = true;
        this.errorText = result.StatusMessage;
        this.loginLoading = false;
      }
      else{
        this.showError = true;
        this.errorText = result.StatusMessage;
        this.loginLoading = false;
      }
    },((error: any)=>{
      console.error(error);
      this.showError = true;
      this.errorText = "An unknown Error occured";
      this.loginLoading = false;
      })
    );
  }

  GoToNext(element){
    console.log(typeof(element))
    element.setFocus();
  }
}
