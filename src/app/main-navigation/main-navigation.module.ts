import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MainNavigationPageRoutingModule } from './main-navigation-routing.module';

import { MainNavigationPage } from './main-navigation.page';
import { HttpClientModule } from '@angular/common/http';

import { SuperTabsModule } from '@ionic-super-tabs/angular';
import { MixerComponent } from '../mixer/mixer.component';
import { AddCommercialComponent } from '../add-commercial/add-commercial.component';
import { AddPadComponent } from '../add-pad/add-pad.component';
import { WebBrowserComponent } from '../web-browser/web-browser.component';
import { SettingsComponent } from '../settings/settings.component';
import { TestComponent } from '../test/test.component';
import { AddPadModalComponent } from '../add-pad-modal/add-pad-modal.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatSliderModule } from '@angular/material/slider';
import {MatSelectModule} from '@angular/material/select';
import 'hammerjs';
import { ChannelOptionsModalComponent } from '../channel-options-modal/channel-options-modal.component';
import { LogoutModalComponent } from '../logout-modal/logout-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    HttpClientModule,
    MainNavigationPageRoutingModule,
    SuperTabsModule,
    DragDropModule,
    MatSliderModule,
    MatSelectModule
  ],
  declarations: [
    MainNavigationPage,
    MixerComponent,
    AddCommercialComponent,
    AddPadComponent,
    WebBrowserComponent,
    SettingsComponent,
    AddPadModalComponent,
    ChannelOptionsModalComponent,
    LogoutModalComponent,
    TestComponent
  ],
  providers:[
    
  ]
})
export class MainNavigationPageModule {}
