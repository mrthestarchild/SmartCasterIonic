import { Component, Host, NgZone, OnInit, AfterViewInit } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { ModalController, Platform } from '@ionic/angular';
import { ChannelData } from 'src/models/channel-data.model';
import { Channel } from 'src/models/channel.model';
import { HammerEvent } from 'src/models/hammer-event.interface';
import { MixerKnob } from 'src/models/mixer-knob.model';
import { Mixer as MixerModel } from 'src/models/mixer.model';
import { LoginResponse } from 'src/models/response/login-response.model';
import { SoundLevelResponse } from 'src/models/response/sound-level-response.model';
import { SpotResponse } from 'src/models/response/spot-response.model';
import { UserAccountService } from 'src/services/account.service';
import { UtilsService } from 'src/services/utils.service';
import { ChannelOptionsModalComponent } from '../channel-options-modal/channel-options-modal.component';
import { MainNavigationPage } from '../main-navigation/main-navigation.page';
import { CommercialPlayerService } from 'src/services/commercial-player.service';
import { AdjustEqRequest, AdjustVolumeRequest, AudioSessionEvent, AudioSessionHandlerTypes, AudioSessionPortType, ChannelPropertyRequest, EqType, InitAudioSessionRequest, InitChannelRequest, InputType, Mixer, ResponseStatus, VolumeMeterEvent } from '@skylabs_technology/capacitor-mixer';
import { MixerService } from 'src/services/mixer.service';
import { MessageQueueService } from 'src/services/message-queue.service';
import { Message } from 'src/models/message.model';
import { PluginListenerHandle } from '@capacitor/core';
import { PadPlayerService } from 'src/services/pad-player.service';

@Component({
  selector: 'app-mixer',
  templateUrl: './mixer.component.html',
  styleUrls: ['./mixer.component.scss'],
})
export class MixerComponent implements OnInit, AfterViewInit {

  _mainNav: MainNavigationPage;

  userInfo: LoginResponse;
  selectedPadCollectionIndex: number = 0;
  commercialIndex: number = 0;

  showPads: boolean = false;
  selectedSoundLevel: SoundLevelResponse;

  prevDeltaY: number = 0;
  knobOffset: number = 0;

  isAudioSessionActive: boolean = false;

  audioSessionListenerName: string = "audioSessionListener";
  audioSessionListener: PluginListenerHandle;

  trebleFrequency: number = 0;

  meterListenerOne: PluginListenerHandle;
  meterListenerTwo: PluginListenerHandle;
  meterListenerThree: PluginListenerHandle;
  meterListenerFour: PluginListenerHandle;

  meterListenerCommercial: PluginListenerHandle;

  meterListenerPad: PluginListenerHandle;

  meterLabels: Array<number> = [0, 10, 20, 30, 40, 50, 60]; 
  
  constructor(private _userAccountService: UserAccountService,
              private _utilsService: UtilsService,
              private _ngZone: NgZone,
              private _modal: ModalController,
              private _mixerService: MixerService,
              private _messageQueueService: MessageQueueService,
              private _commercialPlayerService: CommercialPlayerService,
              private _padPlayerService: PadPlayerService,
              private _platform: Platform,
              @Host() mainNav: MainNavigationPage) {
    this._mainNav = mainNav;
    this._userAccountService.userInfo$.subscribe(result =>{
      this.userInfo = result;
    });
    if(!this.userInfo){
      this.userInfo = this._userAccountService.GetSavedUserAccountInfo();
      this.CheckForSoundLevelCollection();
    }
    this._commercialPlayerService.meterLevel$.subscribe(meterLevel => {
      this.HandleMetering(meterLevel, 4);
    });
    this._padPlayerService.meterLevel$.subscribe(meterLevel => {
      this.HandleMetering(meterLevel, 5);
    })
  }

  ngOnInit() {}

  ngAfterViewInit(){}

  /**
   * Initilizes an Audio Session for the Mixer and regesters a listener for all interupts 
   */
  async InitAudioSession(){
    this.DeinitAudioSession();
    let bufferDuration: number = .05;
    let request: InitAudioSessionRequest = {
      audioSessionListenerName: this.audioSessionListenerName,
      inputPortType: AudioSessionPortType.USB_AUDIO,
      ioBufferDuration: bufferDuration
    }
    let response = await Mixer.initAudioSession(request);
    if(response.status == ResponseStatus.SUCCESS) {
      // let message: Message = new Message();
      // message.UserMessage = `${response.message} usb type: ${response.data.preferredInputPortType}`;
      // message.MessageQueueType = MessageQueueType.Success;
      // this._messageQueueService.AddMessageToQueue(message);
      if(response.data.preferredInputPortType.toLowerCase() == AudioSessionPortType.USB_AUDIO.toLowerCase()) {
        this.isAudioSessionActive = true;
        this.audioSessionListener = await Mixer.addListener(this.audioSessionListenerName, this.OnAudioSessionChangeEvent.bind(this));
        await this.InitializeAudioFiles();
        await this.InitializeMicInputs();
        this._commercialPlayerService.SetCommercial(this.userInfo.SpotCollections[0]);
      }
    }
    else {
      let message: Message = new Message();
      message.UserMessage = response.message;
      this._messageQueueService.AddMessageToQueue(message);
    }
  }

  async DeinitAudioSession() {
    let deinitResponse = await Mixer.deinitAudioSession();
    if(deinitResponse.status == ResponseStatus.SUCCESS) {
      this.isAudioSessionActive = false;
    }
    else {
      let message: Message = new Message();
      message.UserMessage = deinitResponse.message;
      this._messageQueueService.AddMessageToQueue(message);
    }
  }

  async InitializeAudioFiles() {
    this.userInfo.Spots.forEach(async (spot: SpotResponse) => {
      let response = await this._mixerService.CreateAudioInput(spot);
      if(response.status == ResponseStatus.SUCCESS){
        // TODO: figure out when to we handle listeners.
        // let message: Message = new Message();
        // message.UserMessage = response.message;
        // message.MessageQueueType = MessageQueueType.Success;
        // this._messageQueueService.AddMessageToQueue(message);
      }
      else {
        let message: Message = new Message();
        message.UserMessage = response.message;
        this._messageQueueService.AddMessageToQueue(message);
      }
    });
  }

  async InitializeMicInputs() {
    for(var x = 0; x < 4; x++) {
      let response = await this._mixerService.CreateMixerInput(x);
      if(response.status == ResponseStatus.SUCCESS) {
        // let message: Message = new Message();
        // message.UserMessage = response.message;
        // message.MessageQueueType = MessageQueueType.Success;
        // this._messageQueueService.AddMessageToQueue(message);
        switch(x){
          case 0:
            this.meterListenerOne = await Mixer.addListener(`${response.data.value}${this._utilsService.meterListenerExtension}`, (response: VolumeMeterEvent) => {this.HandleMetering(response, 0)});
            break;
          case 1: 
            this.meterListenerTwo = await Mixer.addListener(`${response.data.value}${this._utilsService.meterListenerExtension}`, (response: VolumeMeterEvent) => {this.HandleMetering(response, 1)});
            break;
          case 2:
            this.meterListenerThree = await Mixer.addListener(`${response.data.value}${this._utilsService.meterListenerExtension}`, (response: VolumeMeterEvent) => {this.HandleMetering(response, 2)});
            break;
          case 3:
            this.meterListenerFour = await Mixer.addListener(`${response.data.value}${this._utilsService.meterListenerExtension}`, (response: VolumeMeterEvent) => {this.HandleMetering(response, 3)});
            break;
        }
        
      }
      else {
        let message: Message = new Message();
        message.UserMessage = response.message;
        this._messageQueueService.AddMessageToQueue(message);
      }
    }
  }

  /**
   * Initializes the sound levels for a user that doesn't have a sound levels set yet.
   */
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
      this.userInfo.SoundLevels[0].MixerChannelsJson = new MixerModel();
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
              this.userInfo.SoundLevels[0].MixerChannelsJson.Channels[index].MixerKnobs[knobIndex].CurrentFrequency = this._platform.is('android') ? 20000 : 1500
              break;
            case 1:
              this.userInfo.SoundLevels[0].MixerChannelsJson.Channels[index].MixerKnobs[knobIndex].MixerKnobImage = "MidKnob.png";
              this.userInfo.SoundLevels[0].MixerChannelsJson.Channels[index].MixerKnobs[knobIndex].CurrentFrequency = this._platform.is('android') ? 1499 : 500
              break;
            case 2:
              this.userInfo.SoundLevels[0].MixerChannelsJson.Channels[index].MixerKnobs[knobIndex].MixerKnobImage = "BassKnob.png";
              this.userInfo.SoundLevels[0].MixerChannelsJson.Channels[index].MixerKnobs[knobIndex].CurrentFrequency = this._platform.is('android') ? 200 : 115
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

  async TurnEqKnob(event: any, mixerKnob: MixerKnob, containerIndex: number, channelIndex: number){
    let panEvent = event as HammerEvent<HTMLImageElement>;
    let mixerLocation = document.getElementById(`eqKnob${containerIndex}${channelIndex}`);
    if (panEvent.type == 'pan' && panEvent.isFirst == false && panEvent.isFinal == false) // panning
    { 
      mixerLocation = this.SetDegressCalc(mixerLocation, -((panEvent.deltaY)/4));
      if(this.GetDegreeCalc(mixerLocation) <= 0){
        mixerLocation.style.transform = "rotate(0deg)";
      }
      else if(this.GetDegreeCalc(mixerLocation) >= 280){
        mixerLocation.style.transform = "rotate(280deg)";
      }
      // TODO: review this calculation.
      let eqValue = ((this.GetDegreeCalc(mixerLocation)) / 9.3) - 15;
      mixerKnob.CurrentVolume = Math.round(eqValue);

      let request: AdjustEqRequest;
      
      switch (containerIndex) {
        case 0:
        case 1:
        case 2:
        case 3:
          switch (channelIndex) {
            case 0:
              request = this.BuildEqRequest(`input${containerIndex}`, EqType.TREBLE, InputType.MIC, mixerKnob.CurrentFrequency, Math.round(eqValue));
              await Mixer.adjustEq(request);
              break;
            case 1:
              request = this.BuildEqRequest(`input${containerIndex}`, EqType.MID, InputType.MIC, mixerKnob.CurrentFrequency, Math.round(eqValue));
              await Mixer.adjustEq(request);
              break;
            case 2:
              request = this.BuildEqRequest(`input${containerIndex}`, EqType.BASS, InputType.MIC, mixerKnob.CurrentFrequency,  Math.round(eqValue));
              await Mixer.adjustEq(request);
              break;
          }
          break;
        case 4:
          switch (channelIndex) {
            case 0:
              this._commercialPlayerService.AdjustEq(EqType.TREBLE, mixerKnob.CurrentFrequency, eqValue);
              break;
            case 1:
              this._commercialPlayerService.AdjustEq(EqType.MID, mixerKnob.CurrentFrequency, eqValue);
              break;
            case 2:
              this._commercialPlayerService.AdjustEq(EqType.BASS, mixerKnob.CurrentFrequency, eqValue);
              break;
          }
          break;
        case 5:
          switch (channelIndex) {
            case 0:
              this._padPlayerService.AdjustEq(EqType.TREBLE, mixerKnob.CurrentFrequency, eqValue);
              break;
            case 1:
              this._padPlayerService.AdjustEq(EqType.MID, mixerKnob.CurrentFrequency, eqValue);
              break;
            case 2:
              this._padPlayerService.AdjustEq(EqType.BASS, mixerKnob.CurrentFrequency, eqValue);
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
  async UpdateVolume(event: MatSliderChange, channelIndex: number, channel: Channel){
    switch (channelIndex) {
      case 0:
      case 1:
      case 2:
      case 3:
        if(!channel.IsMuted){
          let request: AdjustVolumeRequest = {
            audioId: `input${channelIndex}`,
            inputType: InputType.MIC,
            volume: event.value
          }
          let response = await Mixer.adjustVolume(request);
          if(response.status == ResponseStatus.SUCCESS) {

          }
          else {
            let message: Message = new Message();
            message.UserMessage = response.message;
            this._messageQueueService.AddMessageToQueue(message);
          }
        }
        break;
      case 4:
        if(!channel.IsMuted){
          await this._commercialPlayerService.AdjustVolume(channel.CurrentVolume);
        }
        break;
      case 5:
        if(!channel.IsMuted){
          await this._padPlayerService.AdjustVolume(channel.CurrentVolume);
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
    this._ngZone.run(async () =>{
      channel.IsMuted = !channel.IsMuted;
      let request: AdjustVolumeRequest;
      switch (channelIndex) {
        case 0:
        case 1:
        case 2:
        case 3:
          if(!channel.IsMuted) {
            request = this.BuildVolumeRequest(`input${channelIndex}`, InputType.MIC, channel.CurrentVolume);
            let response = await Mixer.adjustVolume(request);
            if(response.status == ResponseStatus.SUCCESS) {

            }
            else {
              // TODO: write error handling 
            }
          }
          else {
            request = this.BuildVolumeRequest(`input${channelIndex}`, InputType.MIC, 0);
            let response = await Mixer.adjustVolume(request);
            if(response.status == ResponseStatus.SUCCESS) {

            }
            else {
              // TODO: write error handling 
            }
          }
          break;
        case 4:
          if(!channel.IsMuted){
            await this._commercialPlayerService.AdjustVolume(channel.CurrentVolume);
          }
          else{
            await this._commercialPlayerService.AdjustVolume(0);
          }
          break;
        case 5:
          if(!channel.IsMuted){
            await this._padPlayerService.AdjustVolume(channel.CurrentVolume);
          }
          else{
            await this._padPlayerService.AdjustVolume(0);
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
  async PlayAudioFile(fileInfo: SpotResponse){
    await this._padPlayerService.PlayPausePlayer(fileInfo);
  }

  /**
   * Sets commercial globally that will be edited throughout application
   * @param commercialIndex 
   */
  SelectCommercialToEdit(commercialIndex: number){
    this._ngZone.run(() =>{
      this.commercialIndex = commercialIndex;
      this._commercialPlayerService.SetCommercial(this.userInfo.SpotCollections[commercialIndex]);
    });
  }

  Log(){
    return true;
  }

  /**
   * Builds a EQ request and returns an AdjustEqREquest
   * @param audioId 
   * @param eqType 
   * @param inputType 
   * @param gain 
   * @returns 
   */
  BuildEqRequest(audioId: string, eqType: EqType, inputType: InputType, frequency: number, gain: number): AdjustEqRequest {
    return {
      audioId: audioId,
      eqType: eqType,
      frequency: frequency,
      gain: gain,
      inputType: inputType
    };
  }

  /**
   * Utility method to build a volume request
   * @param audioId 
   * @param inputType 
   * @param gain 
   * @returns 
   */
  BuildVolumeRequest(audioId: string, inputType: InputType, gain: number): AdjustVolumeRequest {
    return {
      audioId: audioId,
      inputType: inputType,
      volume: gain
    };
  }

  /**
   * Handles volume metering for the given input channel
   * @param response 
   */
  HandleMetering(response: VolumeMeterEvent, inputNumber: number): void {
    let meterMask: HTMLElement = document.getElementById(`meter-mask-${inputNumber}`);
    let valuePercent = 100/80;
    let height = `${valuePercent * -(response.meterLevel)}%`
    meterMask.style.height = height;
  }

  /**
   * handles audio session changes once audio session has been initilized.
   * @param response 
   */
  OnAudioSessionChangeEvent(response: AudioSessionEvent){
    if(response.handlerType == AudioSessionHandlerTypes.ROUTE_DEVICE_DISCONNECTED){

    }
    else if (response.handlerType == AudioSessionHandlerTypes.ROUTE_DEVICE_RECONNECTED) {

    }
    else if (response.handlerType == AudioSessionHandlerTypes.INTERRUPT_BEGAN) {

    }
    else if (response.handlerType == AudioSessionHandlerTypes.INTERRUPT_ENDED) {

    }
  }

}
