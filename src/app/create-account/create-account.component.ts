import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CreateUserAccountRequest } from '../../models/request/create-user-account-request.model';
import { UserAccountService } from 'src/services/account.service';
import { ContactPreference } from 'src/utils/contact-preference.enum';
import { StatusCode } from 'src/utils/status-code.enum';
import { ModalController } from '@ionic/angular';
import { CreateAccountSubmitModalComponent } from '../create-account-submit-modal/create-account-submit-modal.component';
import { AuthenticationService } from 'src/services/authentication.service';
import { LoginRequest } from 'src/models/request/login-request.model';
import { GlobalService } from 'src/services/global.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss']
})
export class CreateAccountComponent implements OnInit {
  preference: Array<string> = ['Email', 'Phone', 'Text'];
  selectedIndex = 0;
  
  payload: CreateUserAccountRequest;
  showError: boolean = false;
  errorMessage: string = "";
  loading: boolean = false;

  createAccountForm = this._fb.group({
    businessName: ['', [Validators.required, Validators.minLength(2)]],
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    username: ['', [Validators.required, Validators.minLength(2)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(new RegExp(/((?=.*\d)(?=.*[A-za-z])(?=.*[!@#$%^&*()_+\-=\\\{\}\[\]|:;"'<>,.\/?]).{8})/))]],
    confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    email: ['', [Validators.required, Validators.minLength(1), Validators.email]],
    phoneNumber: ['', [Validators.required, Validators.minLength(13), Validators.maxLength(13), Validators.pattern(new RegExp(/^\(\d{3}\)\d{3}-\d{4}$/))]],
  }, {validators: this.CheckMatchingPassword()});

  constructor(private _fb: FormBuilder,
              private _userAccountService: UserAccountService,
              private _modal: ModalController,
              private _authService: AuthenticationService,
              private _globalService: GlobalService,
              private _router: Router) {
  }

  ngOnInit(): void {
  }

  CheckMatchingPassword(){
    if(!this.createAccountForm) return;
    let password = this.createAccountForm.controls.password.value;
    let passwordConfirm = this.createAccountForm.controls.confirmPassword.value;
    if(password != passwordConfirm){
      this.createAccountForm.controls.confirmPassword.setErrors({notEquivalent: true})
    }
    else{
      this.createAccountForm.controls.confirmPassword.setErrors(null);
    }
  }

  CreateAccount() {
    this.loading = true;
    this.payload = new CreateUserAccountRequest();
    if(this.createAccountForm.valid){
      this.payload.BusinessName = this.createAccountForm.controls.businessName.value;
      this.payload.FirstName = this.createAccountForm.controls.firstName.value;
      this.payload.LastName = this.createAccountForm.controls.lastName.value;
      this.payload.ContactPreference = ContactPreference.Email;
      this.payload.Email = this.createAccountForm.controls.email.value;
      this.payload.PhoneNumber = this.createAccountForm.controls.phoneNumber.value;
      this.payload.UserName = this.createAccountForm.controls.username.value;
      this.payload.Password = this.createAccountForm.controls.password.value;
      this._userAccountService.CreateUserAccount(this.payload).subscribe(response =>{
        if(response.StatusCode == StatusCode.Success){
          this.ShowCreateAccountModal("Success", response.StatusMessage);
          this.loading = false;
        }
        else if(response.StatusCode == StatusCode.InvalidInput){
          this.ShowCreateAccountModal("Invalid Info", response.StatusMessage);
          this.loading = false;
        }
        else{
          this.ShowCreateAccountModal("Error", response.StatusMessage);
          this.loading = false;
        }
      })
    }
  }

  async ShowCreateAccountModal(statusCode: string, statusMessage: string){
    const modal = await this._modal.create({
      component: CreateAccountSubmitModalComponent,
      cssClass: "logout-modal",
      componentProps: {
        "responseStatus": statusCode,
        "responseMessage": statusMessage,
      }
    });

    modal.onDidDismiss().then((_data: any) =>{
      if(_data['data'] != null){
        let result = _data['data'];
        if(result == true && statusCode == StatusCode.Success){
          let payload: LoginRequest = {
            Username: this.createAccountForm.controls.username.value,
            Password: this.createAccountForm.controls.password.value,
          }
          this._authService.RequestLogin(payload).subscribe(result => {
            if (result.StatusCode === StatusCode.Success) {
              this._userAccountService.SaveUserAccountInfo(result.Data);
              this._globalService.LogInUser(true);
              this._router.navigateByUrl('/main-navigation');
            } 
            else{
              this.showError = true;
              this.errorMessage = result.StatusMessage;
              this.loading = false;
            }
          },((error: any)=>{
            console.error(error);
            this.showError = true;
            this.errorMessage = "An unknown Error occured";
            this.loading = false;
            })
          );
        }
        else{
          console.warn("User must take an action");
          this.showError = true;
          this.errorMessage = result.StatusMessage;
        }
      }
      else{
        console.log("We didn't get data :(");
      }
    })
    return await modal.present(); 
  }
}
