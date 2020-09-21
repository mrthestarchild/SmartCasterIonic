import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SpotResponse } from 'src/models/response/spot-response.model';
import { AddPad } from 'src/models/add-pad.model';
import { Keyboard } from '@ionic-native/keyboard/ngx';

@Component({
  selector: 'app-add-pad-modal',
  templateUrl: './add-pad-modal.component.html',
  styleUrls: ['./add-pad-modal.component.scss'],
})
export class AddPadModalComponent implements OnInit {

  @Input() spots: Array<SpotResponse>;
  spotColor: string = '#27aae1';
  padData: AddPad = new AddPad();

  constructor(private _modal: ModalController,
              private _keyboard: Keyboard) { }

  ngOnInit() {
    this.padData.Name = '';
    this.padData.SelectedBackgroundColor = '';
    this.padData.SelectedIndex = -1;
  }

  CreatePad(){
    if(this.padData.Name == ''){
      this.padData.Name == this.spots[this.padData.SelectedIndex].Name;
    }
    this._modal.dismiss(this.padData);
  }

  Cancel(){
    this._modal.dismiss(null);
  }

}
