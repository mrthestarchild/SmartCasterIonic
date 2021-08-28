import { Component, ElementRef, ViewChild, NgZone } from '@angular/core';
import { Animation, AnimationController } from '@ionic/angular';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { setClassMetadata } from '@angular/core/src/r3_symbols';
import { Router } from '@angular/router';
import { SessionIdentifiers } from 'src/utils/session-identifiers.enum';
import { LoginComponent } from '../login/login.component';
import { UserAccountService } from 'src/services/account.service';
import { SpotCollectionResponse } from 'src/models/response/spot-collection-response.model';
import { CommercialPlayerService } from 'src/services/commercial-player.service';
import { GlobalService } from 'src/services/global.service';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  animations: [
    trigger('showLoginAnimation', [
      state('true', style({ 
        opacity: 1,
        transform: "*",
        height: "*",
        margin: "*"
      })),
      state('false', style(
        { 
          opacity: 0,
          transform: "scale(0)",
          height: 0,
          margin: 0
        }
        )),
      transition('true => false', animate('400ms')),
      transition('false => true', animate('400ms'))
    ]),
    trigger('colorRotate', [
      state('true', style({ 
        opacity: 1,
        transform: "*",
        height: "*"
      })),
      state('false', style(
        { 
          opacity: 0,
          transform: "scale(0)",
          height: 0
        }
        )),
      transition('true => false', animate('500ms')),
      transition('false => true', animate('500ms'))
    ]),
      trigger('showMainLoading', [
        state('true', style(
          { 
            opacity: 1,
            "z-index": "*"
          })
        ),
        state('false', style(
          { 
            opacity: 0,
            "z-index": "-1"
          })
        ),
        transition('true => false', animate('1000ms')),
        transition('false => true', animate('1000ms'))
      ]),
  ]
})
export class HomePage {

  @ViewChild('logo',{ read: ElementRef, static: true }) logo: ElementRef;

  @ViewChild('login', {static: true}) loginComponent: LoginComponent;

  showLogin: boolean = true;
  changeColor: boolean = true;
  hideLogo: Animation;
  loadingInfoMessage: string = "";
  showMainLoading: boolean = false;

  constructor(private _userAccountService: UserAccountService,
              private _commercialService: CommercialPlayerService,
              private _globalService: GlobalService,
              private _router: Router,
              private _ngZone: NgZone) {
      // TODO: remove after testing?
      let userLoggedIn = JSON.parse(localStorage.getItem(SessionIdentifiers.UserLoggedIn));
      console.log("userLoggedIn: " + userLoggedIn);
      if(userLoggedIn === true) {
        this.AutoLoginUser();
      }
  }

  /**
   * Logs in a user automatically if the user has not logged out of their account.
   */
  async AutoLoginUser() {
    let userInfo = await this._userAccountService.GetSavedUserAccountInfo();
    if(userInfo){
      userInfo = await this.loginComponent.InitApplication(userInfo);
      this._userAccountService.SaveUserAccountInfo(userInfo);
      if(userInfo.SpotCollections[0] != null){
        this._commercialService.SetCommercial(userInfo.SpotCollections[0]);
      }
      else {
        userInfo.SpotCollections[0] = new SpotCollectionResponse();
        this._commercialService.SetCommercial(userInfo.SpotCollections[0]);
      }
      this._globalService.LogInUser(true);
      this._router.navigateByUrl("/main-navigation");
    }
  }

  /**
   * Opens the create account page for the user
   */
  OpenCreateAccount() {
    this.showLogin = false;
  }

  /**
   * Closes the create account page for the user
   */
  CloseCreateAccount() {
    this._ngZone.run(() =>{
      this.showLogin = true;
    });
  }

}
