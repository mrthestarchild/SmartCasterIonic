import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { LoginComponent } from '../login/login.component';
import { HttpClientModule } from '@angular/common/http';
import { CreateAccountComponent } from '../create-account/create-account.component';
import { SimpleMaskModule } from 'ngx-ion-simple-mask';
import { CreateAccountSubmitModalComponent } from '../create-account-submit-modal/create-account-submit-modal.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    HomePageRoutingModule,
    HttpClientModule,
    SimpleMaskModule
  ],
  declarations: [
    HomePage,
    LoginComponent,
    CreateAccountComponent,
    CreateAccountSubmitModalComponent
  ]
})
export class HomePageModule {}
