import { Injectable } from '@angular/core';
import { BaseResponse, InitChannelRequest, InitResponse, Mixer, ResponseStatus } from '@skylabs_technology/capacitor-mixer';
import { BehaviorSubject } from 'rxjs';
import { SpotResponse } from 'src/models/response/spot-response.model';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root'
})
export class MixerService {

  private audioSessionActive = new BehaviorSubject<boolean>(false);
  audioSessionActive$ = this.audioSessionActive.asObservable();
  localAudioSessionActive: boolean = false

  constructor(private _utilsService: UtilsService) { }

  SetAudioSessionStatus(value: boolean) {
    this.localAudioSessionActive = value;
    this.audioSessionActive.next(this.localAudioSessionActive);
  }

  async CreateMixerInput(index: number): Promise<BaseResponse<InitResponse>> {
    let micName = `input${index}`;
    let request: InitChannelRequest = {
      audioId: micName,
      channelListenerName: `${micName}${this._utilsService.meterListenerExtension}`,
      channelNumber: index,
      volume: 0
    }
    return await Mixer.initMicInput(request);
  }

  async CreateAudioInput(spot: SpotResponse): Promise<BaseResponse<InitResponse>>{
    let meterListener = `${spot.Name}${this._utilsService.meterListenerExtension}`;
    let elapsedListener = `${spot.Name}${this._utilsService.elapsedTimeListenerExtension}`;
    let request: InitChannelRequest = {
      audioId: spot.Name,
      channelListenerName: meterListener,
      filePath: spot.Uri,
      elapsedTimeEventName: elapsedListener,
      volume: .8,
    };
    return await Mixer.initAudioFile(request);
  }
}
