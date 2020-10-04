import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule, HammerModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Device } from '@ionic-native/device/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SmartCasterInterceptor } from './smart-caster.interceptor';
import { SuperTabsModule } from '@ionic-super-tabs/angular';
import { BluetoothLE } from '@ionic-native/bluetooth-le/ngx';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { Chooser } from '@ionic-native/chooser/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { File } from '@ionic-native/file/ngx';
import { Media } from '@ionic-native/media/ngx';
import { MatSliderModule } from '@angular/material/slider';
import { HammerjsConfig } from './hammerjs-config.model';
import { PipesModule } from './pipes.module';

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
    BluetoothLE,
    BluetoothSerial,
    Chooser,
    InAppBrowser,
    Keyboard,
    File,
    Media,
    Device,
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
