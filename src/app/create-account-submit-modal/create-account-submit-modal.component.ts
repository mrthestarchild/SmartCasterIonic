import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-create-account-submit-modal',
  templateUrl: './create-account-submit-modal.component.html',
  styleUrls: ['./create-account-submit-modal.component.scss'],
})
export class CreateAccountSubmitModalComponent implements OnInit {

  @Input() responseStatus: string;
  @Input() responseMessage: string;

  constructor(private _modal: ModalController) { }

  ngOnInit() {}

  DoLogin(){
    this._modal.dismiss(true);
  }

  Cancel(){
    this._modal.dismiss(null);
  }

}
