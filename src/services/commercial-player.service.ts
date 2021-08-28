import { Injectable, NgZone } from '@angular/core';
import { PluginListenerHandle } from '@capacitor/core';
import { AdjustEqRequest, AdjustVolumeRequest, BaseMixerRequest, EqType, InputType, Mixer, MixerTimeEvent, MixerTimeResponse, PlayerState, ResponseStatus, VolumeMeterEvent } from '@skylabs_technology/capacitor-mixer';
import { Subject } from 'rxjs';
import { SpotCollectionResponse } from 'src/models/response/spot-collection-response.model';
import { UtilsService } from './utils.service';
import { Message } from 'src/models/message.model';
import { MessageQueueService } from './message-queue.service';
import { Platform } from '@ionic/angular';
import { MixerService } from './mixer.service';

@Injectable({
  providedIn: 'root'
})
export class CommercialPlayerService {

  private currentCommercialList = new Subject<SpotCollectionResponse>();
  currentCommercialList$ = this.currentCommercialList.asObservable();
  localCommercialList: SpotCollectionResponse;

  private currentIndex = new Subject<number>();
  currentIndex$ = this.currentIndex.asObservable();
  localCurrentIndex: number = 0;

  private currentTimePlayed = new Subject<MixerTimeResponse>();
  currentTimePlayed$ = this.currentTimePlayed.asObservable();
  localCurrentTimePlayed: MixerTimeResponse = this.ResetMixerResponse();

  private totalTimePlayed = new Subject<MixerTimeResponse>();
  totalTimePlayed$ = this.totalTimePlayed.asObservable();
  localTotalTimePlayed: MixerTimeResponse = this.ResetMixerResponse();

  private meterLevel = new Subject<VolumeMeterEvent>();
  meterLevel$ = this.meterLevel.asObservable();
  localMeterLevel: VolumeMeterEvent = {meterLevel: -80};


  localPlayerState: PlayerState = "stop";

  currentElapsedTimeListener: PluginListenerHandle;
  currentMeterListener: PluginListenerHandle;

  previousTimePlayed: MixerTimeResponse = this.ResetMixerResponse();

  currentVolume: number = 0;

  currentTrebleFrequency: number;
  currentTrebleGain: number = 0;
  currentMidFrequency: number;
  currentMidGain: number = 0;
  currentBassFrequency: number;
  currentBassGain: number = 0;

  audioSessionActive: boolean;

  constructor(private _utilsService: UtilsService,
              private _messageQueueService: MessageQueueService,
              private _platform: Platform,
              private _mixerService: MixerService) {
    this.currentTrebleFrequency = this._platform.is('android') ? 20000 : 1500;
    this.currentMidFrequency = this._platform.is('android') ? 1499 : 500;
    this.currentBassFrequency = this._platform.is('android') ? 200 : 115;
    this._mixerService.audioSessionActive$.subscribe(value => {
      this.audioSessionActive = value;
    });
    if(!this.audioSessionActive) {
      this.audioSessionActive = this._mixerService.localAudioSessionActive;
    }
  }

  /**
   * Sets a commercial locally and broadcasts the new commercial to the audio player.
   * @param commercial 
   */
  async SetCommercial(commercial: SpotCollectionResponse): Promise<void> {
    this.localCommercialList = commercial;
    this.localCurrentIndex = 0;
    this.previousTimePlayed = this.ResetMixerResponse();
    this.localCurrentTimePlayed = this.ResetMixerResponse();
    if(!this.audioSessionActive) return;
    await this.GetTotalSpotCollectionTime();
    if(this.currentElapsedTimeListener) {
      this.currentElapsedTimeListener.remove();
    }
    this.currentMeterListener = await Mixer.addListener(`${this.localCommercialList.SpotList[this.localCurrentIndex].Name}${this._utilsService.meterListenerExtension}`, this.HandleMeterEvent.bind(this))
    this.currentElapsedTimeListener = await Mixer.addListener(`${this.localCommercialList.SpotList[this.localCurrentIndex].Name}${this._utilsService.elapsedTimeListenerExtension}`, this.HandleElapsedTimeEvent.bind(this))
    this.currentCommercialList.next(commercial);
    this.currentIndex.next(this.localCurrentIndex);
  }

  /**
   * Plays or pauses player
   *  
   * @returns 
   */
  async PlayOrPause(): Promise<PlayerState> {
    return await this.InternalPlayOrPause(false);
  }

  /**
   * Handles play or pause and determines if the should add new listener. 
   * @param isPreviousOrNext 
   * @returns 
   */
  private async InternalPlayOrPause(isPreviousOrNext: boolean): Promise<PlayerState>{
    let playRequest: BaseMixerRequest = {
      audioId: `${this.localCommercialList.SpotList[this.localCurrentIndex].Name}`
    }
    await this.AdjustVolume(this.currentVolume);
    let playResponse = await Mixer.playOrPause(playRequest);
    if(playResponse.status == ResponseStatus.SUCCESS){
      this.localPlayerState = playResponse.data.state;
      if(isPreviousOrNext) {
        this.currentElapsedTimeListener.remove();
        this.currentElapsedTimeListener = await Mixer.addListener(`${this.localCommercialList.SpotList[this.localCurrentIndex].Name}${this._utilsService.elapsedTimeListenerExtension}`, this.HandleElapsedTimeEvent.bind(this))
      }
      return playResponse.data.state;
    }
    else {
      let message: Message = new Message();
      message.UserMessage = playResponse.message;
      this._messageQueueService.AddMessageToQueue(message);
      return "not implemented";
    }
  }

  /**
   * Plays next track in the commericial list 
   */
  async PlayNextTrack(): Promise<void> {
    let stopRequest: BaseMixerRequest = {
      audioId: `${this.localCommercialList.SpotList[this.localCurrentIndex].Name}`
    }
    let stopResponse = await Mixer.stop(stopRequest);
    if(stopResponse.status == ResponseStatus.SUCCESS){
      this.localCurrentIndex++;
      this.previousTimePlayed = await this.GetPreviousTimePlayed();
      this.InternalPlayOrPause(true);
      this.currentIndex.next(this.localCurrentIndex);
    }
    else {
      let message: Message = new Message();
      message.UserMessage = stopResponse.message;
      this._messageQueueService.AddMessageToQueue(message);
    }
  }

  /**
   * Plays previous track in the commericial list 
   */
  async PlayPreviousTrack(): Promise<void> {
    let stopRequest: BaseMixerRequest = {
      audioId: `${this.localCommercialList.SpotList[this.localCurrentIndex].Name}`
    }
    let response = await Mixer.stop(stopRequest);
    if(response.status == ResponseStatus.SUCCESS){
      this.localCurrentIndex--;
      this.previousTimePlayed = await this.GetPreviousTimePlayed();
      this.InternalPlayOrPause(true);
      this.currentIndex.next(this.localCurrentIndex);
    }
    else {
      let message: Message = new Message();
      message.UserMessage = response.message;
      this._messageQueueService.AddMessageToQueue(message);
    }
  }

  /**
   * Global volume adjustment for commercials
   * @param volume 
   */
  async AdjustVolume(volume: number): Promise<void> {
    let request: AdjustVolumeRequest = {
      audioId: this.localCommercialList.SpotList[this.localCurrentIndex].Name,
      inputType: InputType.FILE,
      volume: volume
    };
    let response = await Mixer.adjustVolume(request);
    if(response.status == ResponseStatus.SUCCESS) {
      this.currentVolume = volume;
    }
    else {
      let message: Message = new Message();
      message.UserMessage = response.message;
      this._messageQueueService.AddMessageToQueue(message);
    }
  }

  /**
   * Global EQ adjustment for commercials
   * @param eqType 
   * @param frequency 
   * @param gain 
   */
  async AdjustEq(eqType: EqType, frequency: number, gain: number): Promise<void> {
    this.SetLocalEq(eqType, frequency, gain);
    let request: AdjustEqRequest = {
      audioId: this.localCommercialList.SpotList[this.localCurrentIndex].Name,
      eqType: eqType,
      frequency: frequency,
      gain: gain,
      inputType: InputType.FILE
    };
    let response = await Mixer.adjustEq(request);
    if(response.status == ResponseStatus.SUCCESS) {
      
    }
    else {
      // TODO: look at adding error handling
    }
  }

  /**
   * Sets local EQ adjustments for commercials
   * @param eqType 
   * @param frequency 
   * @param gain 
   */
  private SetLocalEq(eqType: EqType, frequency: number, gain: number): void {
    if(eqType == EqType.TREBLE) {
      this.currentTrebleFrequency = frequency;
      this.currentTrebleGain = gain;
    }
    else if (eqType == EqType.MID) {
      this.currentMidFrequency = frequency;
      this.currentMidGain = gain;
    }
    else {
      this.currentBassFrequency = frequency;
      this.currentBassGain = gain;
    }
  }

  /**
   * Utility method to get previous time played depending on the song index in commercial list.
   *  
   * @returns 
   */
  private async GetPreviousTimePlayed(): Promise<MixerTimeResponse> {
    return await this.GetMixerTime(false);
  }

  /**
   * Gets total time for set spot collection (commercial block).
   * 
   * @returns 
   */
  async GetTotalSpotCollectionTime(): Promise<void> {
    this.localTotalTimePlayed = await this.GetMixerTime(true);
    this.totalTimePlayed.next(this.localTotalTimePlayed); 
  }

  /**
   * Handles elapsed time event for current running listener and emits event to subscriber
   * @param response 
   */
  private HandleElapsedTimeEvent(response: MixerTimeEvent): void {
    if(response){
      this.localCurrentTimePlayed.hours = this.previousTimePlayed.hours + response.hours;
      this.localCurrentTimePlayed.minutes = this.previousTimePlayed.minutes + response.minutes;
      this.localCurrentTimePlayed.seconds = this.previousTimePlayed.seconds + response.seconds;
      this.localCurrentTimePlayed.milliSeconds = this.previousTimePlayed.milliSeconds + response.milliSeconds;
      this.currentTimePlayed.next(this.localCurrentTimePlayed);
      this.CheckIfPlayNext();
    }
  }

  /**
   * Handles volume meter event and emits event to subscriber
   * @param response 
   */
  private HandleMeterEvent(response: VolumeMeterEvent) {
    this.meterLevel.next(response);
  }

  /**
   * Utility method to help determine current or total time for a spot collection
   * @param isTotalTime 
   * @returns 
   */
  private async GetMixerTime(isTotalTime: boolean): Promise<MixerTimeResponse>{
    let totalTime: MixerTimeResponse = {
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliSeconds: 0
    };
    if(this.localCommercialList == null || this.localCommercialList == undefined) return totalTime;
    if(this.localCommercialList && this.localCommercialList.SpotList.length > 0){
      let length: number =  isTotalTime ? this.localCommercialList.SpotList.length : this.localCurrentIndex - 1;
      for(var x = 0; x < length; x++){
        let request: BaseMixerRequest = {
          audioId: `${this.localCommercialList.SpotList[x].Name}`
        } 
        let response = await Mixer.getTotalTime(request);
        if(response.status == ResponseStatus.SUCCESS){
          totalTime.hours += response.data.hours;
          totalTime.minutes += response.data.minutes;
          totalTime.seconds += response.data.seconds;
          totalTime.milliSeconds += response.data.milliSeconds;
        }
        else {
          let message: Message = new Message();
          message.UserMessage = response.message;
          this._messageQueueService.AddMessageToQueue(message);
        }
      }
    }
    return totalTime;
  }

  /**
   * Does a check to see if we should play next track automatically in the commerical list
   */
  private CheckIfPlayNext() {
    if((this.localCurrentIndex < this.localCommercialList.SpotList.length - 1 &&
        this.localCurrentTimePlayed.hours == this.localTotalTimePlayed.hours && 
        this.localCurrentTimePlayed.minutes == this.localTotalTimePlayed.minutes &&
        this.localCurrentTimePlayed.seconds == this.localTotalTimePlayed.seconds &&
        this.localCurrentTimePlayed.milliSeconds >= this.localTotalTimePlayed.milliSeconds) ||
       (this.localCurrentIndex < this.localCommercialList.SpotList.length - 1 &&
        this.localCurrentTimePlayed.hours == this.localTotalTimePlayed.hours && 
        this.localCurrentTimePlayed.minutes == this.localTotalTimePlayed.minutes &&
        this.localCurrentTimePlayed.seconds > this.localTotalTimePlayed.seconds)) {
      this.PlayNextTrack();
    }
  }

  /**
   * Utility to reset the mixer time responses back to 0
   * @returns 
   */
  private ResetMixerResponse(): MixerTimeResponse {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliSeconds: 0
    };
  }

}
