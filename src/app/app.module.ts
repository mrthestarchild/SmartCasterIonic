import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule, HammerModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Device } from '@ionic-native/device/ngx';

import { AppComponent } from 'src/app/app.component';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SmartCasterInterceptor } from 'src/app/smart-caster.interceptor';
import { SuperTabsModule } from '@ionic-super-tabs/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { MatSliderModule } from '@angular/material/slider';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { IOSFilePicker } from '@ionic-native/file-picker/ngx';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { HammerjsConfig } from 'src/models/hammerjs-config.model';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule, 
    BrowserAnimationsModule,
    HammerModule,
    IonicModule.forRoot(), 
    AppRoutingModule,
    HttpClientModule,
    SuperTabsModule.forRoot(),
    MatSliderModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    InAppBrowser,
    Keyboard,
    Device,
    BackgroundMode,
    IOSFilePicker,
    FileChooser,
    { provide: HTTP_INTERCEPTORS, useClass: SmartCasterInterceptor, multi: true },
    { provide: HAMMER_GESTURE_CONFIG, useClass: HammerjsConfig },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AppModule {}
