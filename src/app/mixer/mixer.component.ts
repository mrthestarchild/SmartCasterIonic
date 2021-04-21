import { Component, Host, NgZone, OnInit, AfterViewInit } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { ModalController } from '@ionic/angular';
import { ChannelData } from 'src/models/channel-data.model';
import { Channel } from 'src/models/channel.model';
import { HammerEvent } from 'src/models/hammer-event.interface';
import { MixerKnob } from 'src/models/mixer-knob.model';
import { Mixer } from 'src/models/mixer.model';
import { LoginResponse } from 'src/models/response/login-response.model';
import { SoundLevelResponse } from 'src/models/response/sound-level-response.model';
import { SpotResponse } from 'src/models/response/spot-response.model';
import { UserAccountService } from 'src/services/account.service';
import { UtilsService } from 'src/services/utils.service';
import { ChannelOptionsModalComponent } from '../channel-options-modal/channel-options-modal.component';
import { MainNavigationPage } from '../main-navigation/main-navigation.page';
import { CommercialPlayerService } from 'src/services/commercial-player.service';
import * as webAudioPeakMeter from 'web-audio-peak-meter';
import { AudioMeterService } from 'src/services/audio-meter.service';

@Component({
  selector: 'app-mixer',
  templateUrl: './mixer.component.html',
  styleUrls: ['./mixer.component.scss'],
})
export class MixerComponent implements OnInit, AfterViewInit {

  _mainNav: MainNavigationPage;
  // _onePeakMeter: any;
  _commercialPeakMeter: any;
  _padPeakMeter: any;

  userInfo: LoginResponse;
  selectedPadCollectionIndex: number = 0;
  showPads: boolean = false;
  selectedSoundLevel: SoundLevelResponse;

  // captureAudioOptions: CaptureAudioOptions;

  prevDeltaY: number = 0;
  knobOffset: number = 0;
  

  constructor(private _userAccountService: UserAccountService,
              private _utilsService: UtilsService,
              private _ngZone: NgZone,
              private _modal: ModalController,
              private _meterService: AudioMeterService,
              private _commercialService: CommercialPlayerService,
              // private _mediaCapture: MediaCapture,
              @Host() mainNav: MainNavigationPage) {
    this._mainNav = mainNav;
    // this._onePeakMeter = new webAudioPeakMeter();
    this._commercialPeakMeter = new webAudioPeakMeter(); 
    this._padPeakMeter = new webAudioPeakMeter();
    this._userAccountService.userInfo$.subscribe(result =>{
      this.userInfo = result;
    });
    if(!this.userInfo){
      this.userInfo = this._userAccountService.GetSavedUserAccountInfo();
      this.CheckForSoundLevelCollection();
    } 
  }

  ngOnInit() {
    
  }

  ngAfterViewInit(){
    setTimeout(() =>{
      // let oneAudioMeter = document.getElementById('meter0');
      // let oneAudioMeterNode = this._onePeakMeter.createMeterNode(this._mainNav.oneBufferSource, this._mainNav.oneAudioContext);
      // this._meterService.SetPeakMeter(oneAudioMeterNode, 0);
      // this._onePeakMeter.createMeter(oneAudioMeter, oneAudioMeterNode, {backgroundColor: "#222"});
      let commercialMeter = document.getElementById('meter4');
      let commercialMeterNode = this._commercialPeakMeter.createMeterNode(this._mainNav.commercialSourceNode, this._mainNav.commercialAudioContext);
      this._commercialPeakMeter.createMeter(commercialMeter, commercialMeterNode, {backgroundColor: "#222"});
      let padMeter = document.getElementById('meter5');
      let padMeterNode = this._padPeakMeter.createMeterNode(this._mainNav.padSourceNode, this._mainNav.padAudioContext);
      this._padPeakMeter.createMeter(padMeter, padMeterNode, {backgroundColor: "#222"});
    },500);
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

  TurnEqKnob(event: HammerEvent<HTMLImageElement>, containerIndex: number, channelIndex: number){
    let mixerLocation = document.getElementById(`eqKnob${containerIndex}${channelIndex}`);
    if (event.type == 'pan' && event.isFirst == false && event.isFinal == false) // panning
    {
      mixerLocation = this.SetDegressCalc(mixerLocation, -((event.deltaY)/4));
      if(this.GetDegreeCalc(mixerLocation) <= 0){
        mixerLocation.style.transform = "rotate(0deg)";
      }
      else if(this.GetDegreeCalc(mixerLocation) >= 280){
        mixerLocation.style.transform = "rotate(280deg)";
      }
      // TODO: review this calculation.
      let eqValue = ((this.GetDegreeCalc(mixerLocation)) / 9.3) - 15;
      this.selectedSoundLevel.MixerChannelsJson.Channels[containerIndex].MixerKnobs[channelIndex].CurrentVolume = Math.round(eqValue);
      
      switch (containerIndex) {
        case 0:
          // switch (channelIndex) {
          //   case 0:
          //     this._mainNav.oneTrebleEqNode.gain.value = eqValue * 2;
          //     break;
          //   case 1:
          //     this._mainNav.oneMidEqNode.gain.value = eqValue * 2;
          //     break;
          //   case 2:
          //     this._mainNav.oneBassEqNode.gain.value = eqValue * 2;
          //     break;
          // }
          // break;
        case 1:
          break;
        case 2:
          break;
        case 3:
          break;
        case 4:
          switch (channelIndex) {
            case 0:
              this._mainNav.commercialTrebleEqNode.gain.value = eqValue * 2;
              break;
            case 1:
              this._mainNav.commercialMidEqNode.gain.value = eqValue * 2;
              break;
            case 2:
              this._mainNav.commercialBassEqNode.gain.value = eqValue * 2;
              break;
          }
          break;
        case 5:
          switch (channelIndex) {
            case 0:
              this._mainNav.padTrebleEqNode.gain.value = eqValue * 2;
              break;
            case 1:
              this._mainNav.padMidEqNode.gain.value = eqValue * 2;
              break;
            case 2:
              this._mainNav.padBassEqNode.gain.value = eqValue * 2;
              break;
          }
          break;
        default:
          break;
      }
      // write check to see if player if playing first before setting value
      // let eqLevel = this.selectedSoundLevel.MixerChannels.Channels[containerIndex].MixerKnobs[index].CurrentVolume * 100;
      // this.SetEqValueInMixer(containerIndex, index, eqLevel, this.eqOptionsList[containerIndex]);
    }
  }

  /**
   * Gets Calculation of how to rotate knob on the view
   * @param element 
   */
  private GetDegreeCalc(element: HTMLElement): number{
    let stringNumber = element.style.transform.replace('rotate(','').replace('deg)','');
    let returnValue = parseFloat(stringNumber);
    if(isNaN(returnValue)){
      returnValue = 0;
    }
    console.log("return value: " + returnValue);
    return returnValue;
  }

  /**
   * Sets Calculation of how to rotate knob on the view
   * @param element 
   * @param modifyValue 
   */
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

  /**
   * Sets volume for a given channel. Event fired from view
   * @param event 
   * @param channelIndex 
   * @param channel 
   */
  UpdateVolume(event: MatSliderChange, channelIndex: number, channel: Channel){
    switch (channelIndex) {
      case 0:
        // if(!channel.IsMuted){
        //   this._onePeakMeter.setGainDiff(event.value);
        //   this._mainNav.oneGainNode.gain.value = event.value;
        // }
        break;
      case 1:
        break;
      case 2:
        break;
      case 3:
        break;
      case 4:
        if(!channel.IsMuted){
          this._commercialPeakMeter.setGainDiff(event.value);
          this._mainNav.commercialGainNode.gain.value = event.value;
        }
        break;
      case 5:
        if(!channel.IsMuted){
          this._padPeakMeter.setGainDiff(event.value);
          this._mainNav.padGainNode.gain.value = event.value;
        } 
        break;
      default:
        break;
    }
  }

  /**
   * Handles muting a channel from the view.
   * @param channel 
   * @param channelIndex 
   */
  ToggleMuteButton(channel: Channel, channelIndex: number){
    this._ngZone.run(() =>{
      channel.IsMuted = !channel.IsMuted;
      switch (channelIndex) {
        case 0:
          // if(!channel.IsMuted){
          //   this._mainNav.oneGainNode.gain.value = channel.CurrentVolume;
          //   this._onePeakMeter.setGainDiff(channel.CurrentVolume);
          // }
          // else{
          //   this._mainNav.commercialGainNode.gain.value = 0;
          //   this._commercialPeakMeter.setGainDiff(0);
          // }
          break;
        case 4:
          if(!channel.IsMuted){
            this._mainNav.commercialGainNode.gain.value = channel.CurrentVolume;
            this._commercialPeakMeter.setGainDiff(channel.CurrentVolume);
          }
          else{
            this._mainNav.commercialGainNode.gain.value = 0;
            this._commercialPeakMeter.setGainDiff(0);
          }
          break;
        case 5:
          if(!channel.IsMuted){
            this._mainNav.padGainNode.gain.value = channel.CurrentVolume;
            this._padPeakMeter.setGainDiff(channel.CurrentVolume);
          }
          else{
            this._mainNav.padGainNode.gain.value = 0;
            this._padPeakMeter.setGainDiff(0);
          }
          break;
        default:
          break;
      }
    });
  }

  /**
   * Toggles pad and commercial view on mixer view
   * @param value 
   */
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

  /**
   * Handles a modal for channel changes.
   * @param channel 
   */
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

  /**
   * Plays audio file on global component
   * @param fileInfo 
   */
  PlayAudioFile(fileInfo: SpotResponse){
    this._mainNav.PlayPadAudioFile(fileInfo);
  }

  /**
   * Sets commercial globally that will be edited throughout application
   * @param commercialIndex 
   */
  SelectCommercialToEdit(commercialIndex: number){
    this._ngZone.run(() =>{
      this._commercialService.SetCommercial(this.userInfo.SpotCollections[commercialIndex]);
    });
  }

  Log(){
    return true;
  }
}
