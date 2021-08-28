import { Injectable } from '@angular/core';
import { AdjustEqRequest, AdjustVolumeRequest, BaseMixerRequest, EqType, InputType, Mixer, ResponseStatus, VolumeMeterEvent } from '@skylabs_technology/capacitor-mixer';
import { Subject } from 'rxjs';
import { Message } from 'src/models/message.model';
import { SpotResponse } from 'src/models/response/spot-response.model';
import { MessageQueueService } from './message-queue.service';
import { MixerService } from './mixer.service';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root'
})
export class PadPlayerService {

  currentPlayingPad: SpotResponse;

  currentVolume = 0;

  currentTrebleFrequency: number;
  currentTrebleGain: number = 0;
  currentMidFrequency: number;
  currentMidGain: number = 0;
  currentBassFrequency: number;
  currentBassGain: number = 0;

  audioSessionActive: boolean;

  private meterLevel = new Subject<VolumeMeterEvent>();
  meterLevel$ = this.meterLevel.asObservable();
  localMeterLevel: VolumeMeterEvent = {meterLevel: -80};

  constructor(private _messageQueueService: MessageQueueService,
              private _mixerService: MixerService) {
    this._mixerService.audioSessionActive$.subscribe(value => {
      this.audioSessionActive = value;
    });
    if(!this.audioSessionActive) {
      this.audioSessionActive = this._mixerService.localAudioSessionActive;
    }
  }

  async PlayPausePlayer(spotInfo: SpotResponse) {
    if(this.currentPlayingPad) {
      let stopRequest: BaseMixerRequest = {
        audioId: this.currentPlayingPad.Name
      }
      let stopResponse = await Mixer.stop(stopRequest);
      if(stopResponse.status == ResponseStatus.ERROR){
        let message: Message = new Message();
        message.UserMessage = stopResponse.message;
        this._messageQueueService.AddMessageToQueue(message);
      }
    }
    this.currentPlayingPad = spotInfo;
    await this.AdjustVolume(this.currentVolume);
    let request: BaseMixerRequest = {
      audioId: this.currentPlayingPad.Name
    }
    let response = await Mixer.playOrPause(request);
    if(response.status == ResponseStatus.ERROR){
      let message: Message = new Message();
      message.UserMessage = response.message;
      this._messageQueueService.AddMessageToQueue(message);
    }
  }

  /**
   * Global volume adjustment for pad
   * @param volume 
   */
  async AdjustVolume(volume: number) {
    let request: AdjustVolumeRequest = {
      audioId: this.currentPlayingPad.Name,
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
   async AdjustEq(eqType: EqType, frequency: number, gain: number) {
    this.SetLocalEq(eqType, frequency, gain);
    let request: AdjustEqRequest = {
      audioId: this.currentPlayingPad.Name,
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
}
