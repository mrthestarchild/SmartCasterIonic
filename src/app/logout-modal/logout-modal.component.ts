import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-logout-modal',
  templateUrl: './logout-modal.component.html',
  styleUrls: ['./logout-modal.component.scss'],
})
export class LogoutModalComponent implements OnInit {

  constructor(private _modal: ModalController) { }

  ngOnInit() {}

  Logout(){
    this._modal.dismiss(true);
  }

  Cancel(){
    this._modal.dismiss(null);
  }

}
