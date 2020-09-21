import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainNavigationPage } from './main-navigation.page';

const routes: Routes = [
  {
    path: '',
    component: MainNavigationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainNavigationPageRoutingModule {}
