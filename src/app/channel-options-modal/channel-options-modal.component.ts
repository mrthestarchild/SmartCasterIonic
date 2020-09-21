import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ChannelData } from 'src/models/channel-data.model';
import { Channel } from 'src/models/channel.model';
import { IonicIconList } from 'src/models/ionic-icon-list.array';

@Component({
  selector: 'app-channel-options-modal',
  templateUrl: './channel-options-modal.component.html',
  styleUrls: ['./channel-options-modal.component.scss'],
})
export class ChannelOptionsModalComponent implements OnInit {

  @Input() _channel: Channel;

  IconList: Array<string> = IonicIconList;


  channelData: ChannelData = new ChannelData;

  constructor(private _modal: ModalController) {
    
  }

  ngOnInit() {
    this.channelData.ChannelName = this._channel.ChannelDisplayName;
    this.channelData.ChannelColor = this._channel.ChannelColor;
    this.channelData.ChannelIcon = this._channel.ChannelIconName;
  }

  CreateChannel(){
    this._modal.dismiss(this.channelData);
  }

  Cancel(){
    this._modal.dismiss(null);
  }

}
