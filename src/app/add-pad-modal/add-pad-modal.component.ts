import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SpotResponse } from 'src/models/response/spot-response.model';
import { AddPad } from 'src/models/add-pad.model';

@Component({
  selector: 'app-add-pad-modal',
  templateUrl: './add-pad-modal.component.html',
  styleUrls: ['./add-pad-modal.component.scss'],
})
export class AddPadModalComponent implements OnInit {

  @Input() spots: Array<SpotResponse>;
  spotColor: string = '#27aae1';
  padData: AddPad = new AddPad();

  constructor(private _modal: ModalController) { }

  ngOnInit() {
    this.padData.Name = '';
    this.padData.SelectedBackgroundColor = '';
    this.padData.SelectedIndex = -1;
  }

  /**
   * Dismisses modal and returns built a data response for the modal
   */
  CreatePad(){
    if(this.padData.Name == ''){
      this.padData.Name == this.spots[this.padData.SelectedIndex].Name;
    }
    this._modal.dismiss(this.padData);
  }

  /**
   * Dismisses modal and returns null
   */
  Cancel(){
    this._modal.dismiss(null);
  }

}
