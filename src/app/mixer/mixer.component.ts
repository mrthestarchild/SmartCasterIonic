import { Component, NgZone, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ChannelColor } from 'src/models/channel-color.model';
import { ChannelData } from 'src/models/channel-data.model';
import { Channel } from 'src/models/channel.model';
import { HammerEvent } from 'src/models/hammer-event.interface';
import { MixerKnob } from 'src/models/mixer-knob.model';
import { Mixer } from 'src/models/mixer.model';
import { LoginResponse } from 'src/models/response/login-response.model';
import { SoundLevelResponse } from 'src/models/response/sound-level-response.model';
import { UserAccountService } from 'src/services/account.service';
import { UtilsService } from 'src/services/utils.service';
import { SessionIdentifiers } from 'src/utils/session-identifiers.enum';
import { ChannelOptionsModalComponent } from '../channel-options-modal/channel-options-modal.component';

@Component({
  selector: 'app-mixer',
  templateUrl: './mixer.component.html',
  styleUrls: ['./mixer.component.scss'],
})
export class MixerComponent implements OnInit {

  userInfo: LoginResponse;
  selectedPadCollectionIndex: number = 0;
  showPads: boolean = false;
  selectedSoundLevel: SoundLevelResponse;

  prevDeltaY: number = 0;
  knobOffset: number = 0;
  

  constructor(private _userAccountService: UserAccountService,
              private _utilsService: UtilsService,
              private _ngZone: NgZone,
              private _modal: ModalController) {
    this._userAccountService.userInfo$.subscribe(result =>{
      this.userInfo = result;
    });
    if(!this.userInfo){
      this.userInfo = JSON.parse(localStorage.getItem(SessionIdentifiers.UserAccoutInfo));
      this.CheckForSoundLevelCollection();
    }
  }

  ngOnInit() {
    
  }

  CheckForSoundLevelCollection(){
    if(this.userInfo.SoundLevels.length == 0){
      this.userInfo.SoundLevels = new Array<SoundLevelResponse>();
      this.userInfo.SoundLevels[0] = new SoundLevelResponse();
      this.userInfo.SoundLevels[0].Id = -1;
      this.userInfo.SoundLevels[0].Name = "Main Mixer";
      this.userInfo.SoundLevels[0].DateCreate = new Date();
      this.userInfo.SoundLevels[0].Description = "Static Mixer Collection For User " +this.userInfo.UserInfo.Name;
      this.userInfo.SoundLevels[0].AuthorUserId = this.userInfo.UserInfo.Id;
      this.userInfo.SoundLevels[0].TechUserId = this.userInfo.UserInfo.Id;
      this.userInfo.SoundLevels[0].IsInput = true;
      this.userInfo.SoundLevels[0].MixerChannelsJson = new Mixer();
      this.userInfo.SoundLevels[0].MixerChannelsJson.Channels = new Array<Channel>();
      for(let index = 0; index < 6; index++){
        this.userInfo.SoundLevels[0].MixerChannelsJson.Channels[index] = new Channel();
        this.userInfo.SoundLevels[0].MixerChannelsJson.Channels[index].ChannelColor = "#FF0000";
        this.userInfo.SoundLevels[0].MixerChannelsJson.Channels[index].ChannelDisplayName = index < 4 ? `Input ${index + 1}` : index == 4 ? "Commercial" : "Pad";
        this.userInfo.SoundLevels[0].MixerChannelsJson.Channels[index].ChannelIconName = index < 4 ? "mic-outline" : index == 4 ? "list-outline" : "grid-outline";
        this.userInfo.SoundLevels[0].MixerChannelsJson.Channels[index].CurrentVolume = 0;
        this.userInfo.SoundLevels[0].MixerChannelsJson.Channels[index].IsMuted = false;
        this.userInfo.SoundLevels[0].MixerChannelsJson.Channels[index].Priority = index;
        this.userInfo.SoundLevels[0].MixerChannelsJson.Channels[index].MixerKnobs = new Array<MixerKnob>();
        for(let knobIndex = 0; knobIndex < 3; knobIndex++){
          this.userInfo.SoundLevels[0].MixerChannelsJson.Channels[index].MixerKnobs[knobIndex] = new MixerKnob();
          this.userInfo.SoundLevels[0].MixerChannelsJson.Channels[index].MixerKnobs[knobIndex].CurrentVolume = 0;
          switch (knobIndex) {
            case 0:
              this.userInfo.SoundLevels[0].MixerChannelsJson.Channels[index].MixerKnobs[knobIndex].MixerKnobImage = "TrebleKnob.png";
              break;
            case 1:
              this.userInfo.SoundLevels[0].MixerChannelsJson.Channels[index].MixerKnobs[knobIndex].MixerKnobImage = "MidKnob.png";
              break;
            case 2:
              this.userInfo.SoundLevels[0].MixerChannelsJson.Channels[index].MixerKnobs[knobIndex].MixerKnobImage = "BassKnob.png";
              break;
            default:
              break;
          }
        }
      }
      this.selectedSoundLevel = this._utilsService.DeepCopy(this.userInfo.SoundLevels[0]);
    }
    else{
      this.selectedSoundLevel = this._utilsService.DeepCopy(this.userInfo.SoundLevels[0]);
    }
  }

  TurnEqKnob(event: HammerEvent<HTMLImageElement>, containerIndex: number, index: number){
    let mixerLocation = document.getElementById(`eqKnob${containerIndex}${index}`);
    if (event.type == 'pan' && event.isFirst == false && event.isFinal == false) // panning
    {
      mixerLocation = this.SetDegressCalc(mixerLocation, -((event.deltaY)/4));
      if(this.GetDegreeCalc(mixerLocation) <= 0){
        mixerLocation.style.transform = "rotate(0deg)";
      }
      else if(this.GetDegreeCalc(mixerLocation) >= 280){
        mixerLocation.style.transform = "rotate(280deg)";
      }

      this.selectedSoundLevel.MixerChannelsJson.Channels[containerIndex].MixerKnobs[index].CurrentVolume = Math.round(((this.GetDegreeCalc(mixerLocation)) / 9.3) - 15);
      // write check to see if player if playing first before setting value
      // let eqLevel = this.selectedSoundLevel.MixerChannels.Channels[containerIndex].MixerKnobs[index].CurrentVolume * 100;
      // this.SetEqValueInMixer(containerIndex, index, eqLevel, this.eqOptionsList[containerIndex]);
    }
  }

  private GetDegreeCalc(element: HTMLElement): number{
    let stringNumber = element.style.transform.replace('rotate(','').replace('deg)','');
    let returnValue = parseFloat(stringNumber);
    if(isNaN(returnValue)){
      returnValue = 0;
    }
    console.log("return value: " + returnValue);
    return returnValue;
  }
  private SetDegressCalc(element: HTMLElement, modifyValue: number): HTMLElement {
    let elementRotate = this.GetDegreeCalc(element);
    let value = elementRotate + modifyValue;
    if(value > 280){
      value = 280;
    }
    else if (value < 0){
      value = 0;
    }
    element.style.transform = `rotate(${value}deg)`;
    return element;
  }

  ToggleMuteButton(channel: Channel){
    this._ngZone.run(() =>{
      channel.IsMuted = !channel.IsMuted;
    });
  }

  ToggleUtilityContainer(value: boolean){
    this.showPads = value;
    let commercialContainer = document.getElementById("commercial-container").classList;
    let padContainer = document.getElementById("pad-container").classList;
    if(value == false && !commercialContainer.contains('selected-container') ){
      document.getElementById("commercial-container").classList.toggle("selected-container");
      document.getElementById("pad-container").classList.toggle("selected-container");
    }
    else if(value == true && !padContainer.contains('selected-container')){
      document.getElementById("commercial-container").classList.toggle("selected-container");
      document.getElementById("pad-container").classList.toggle("selected-container");
    }
  }

  async OpenMixerMenu(channel: Channel){
    const modal = await this._modal.create({
      component: ChannelOptionsModalComponent,
      componentProps: {
        "_channel": channel
      }
    });

    modal.onDidDismiss().then((_data: any) =>{
      if(_data['data'] != null){
        console.log("We got data!");
        console.log(_data['data']);
        let channelData = _data['data'] as ChannelData;
        this._ngZone.run(() =>{
          channel.ChannelColor = channelData.ChannelColor;
          channel.ChannelDisplayName = channelData.ChannelName;
          channel.ChannelIconName = channelData.ChannelIcon;
        });
      }
      else{
        console.log("We didn't get data :(");
      }
    })
    return await modal.present(); 
  }

  Log(){
    return true;
  }
}
