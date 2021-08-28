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

  /**
   * Returns true to parent component to complete logout
   */
  Logout(){
    this._modal.dismiss(true);
  }

  /**
   * Returns null to parent component to cancel logout
   */
  Cancel(){
    this._modal.dismiss(null);
  }

}
