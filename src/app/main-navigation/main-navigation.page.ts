import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnInit, NgZone, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { LoginResponse } from 'src/models/response/login-response.model';
import { SpotResponse } from 'src/models/response/spot-response.model';
import { UserAccountService } from 'src/services/account.service';
import { AuthenticationService } from 'src/services/authentication.service';
import { PadSpotCollectionService } from 'src/services/pad-spot-collection.service';
import { SessionIdentifiers } from 'src/utils/session-identifiers.enum';
import { StatusCode } from 'src/utils/status-code.enum';
import { LogoutModalComponent } from '../logout-modal/logout-modal.component';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';


@Component({
  selector: 'app-main-navigation',
  templateUrl: './main-navigation.page.html',
  styleUrls: ['./main-navigation.page.scss'],
  animations: [
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
export class MainNavigationPage implements OnInit, AfterViewInit {

  loadingInfoMessage: string = "";
  showMainLoading: boolean = false;
  userInfo: LoginResponse;
  superTabsConfig: any = {
    avoidElements: true,
    allowElementScroll: true,
    dragThreshold: 150
  };

  constructor( private _padSpotService: PadSpotCollectionService,
               private _userAccountService: UserAccountService,
               private _modal: ModalController,
               private _authService: AuthenticationService,
               private _router: Router,
               private _ngZone: NgZone, 
               private _backgroundMode: BackgroundMode ) { 
    this._userAccountService.userInfo$.subscribe(result =>{
      this.userInfo = result;
      });
      if(!this.userInfo){
        this.userInfo = this._userAccountService.GetSavedUserAccountInfo();
      }
  }

  ngOnInit() {
    this._backgroundMode.enable();
  }

  ngAfterViewInit(){}

  // TODO: move this to a utility method. 
  public UpdateUserSpotList(userInfo: LoginResponse){
    let request = this._padSpotService.ConvertSpotFromResponseToRequest(userInfo.Spots);
    this._padSpotService.AddUpdateSpot(request).subscribe(response =>{
      if(response.StatusCode = StatusCode.SUCCESS) {
        this.userInfo.Spots = response.Data;
        this._userAccountService.SaveUserAccountInfo(this.userInfo);
      }
    });
  }

  async Logout(){
    const modal = await this._modal.create({
      component: LogoutModalComponent,
      cssClass: "logout-modal"
    });

    modal.onDidDismiss().then((_data: any) =>{
      if(_data['data'] != null){
        let result = _data['data'];
        if(result == true){
          this._authService.RequestLogout().subscribe((result: any) => {
            if(result.StatusCode == StatusCode.SUCCESS){
              localStorage.removeItem(SessionIdentifiers.Authorization);
              localStorage.removeItem(SessionIdentifiers.UserAccoutInfo);
              localStorage.removeItem(SessionIdentifiers.UserLoggedIn);
              this._ngZone.run(()=>{
                this._router.navigateByUrl('/home');
              });
            }
          });
        }
      }
      else{
        console.log("We didn't get data :(");
      }
    })
    return await modal.present(); 
  }
}
