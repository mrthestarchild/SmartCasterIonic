import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { GlobalService } from 'src/services/global.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  isLoggedIn: boolean;
  appLoading: boolean;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private _globalService: GlobalService
  ) {
    this.initializeApp();
    this.appLoading = false;
    // this.isLoggedIn = this._globalService.CheckUserLoggedIn() ? this._globalService.CheckUserLoggedIn() : false;
    this.isLoggedIn = false;
    this._globalService.isLoggedIn$.subscribe(value => {
      this.isLoggedIn = value;
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
