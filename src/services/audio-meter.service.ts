import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioMeterService {

  oneMeter: any;
  twoMeter: any;
  threeMeter: any;
  fourMeter: any;
  commericalMeter: any;
  padMeter: any;

  constructor() { }

  SetPeakMeter(meter: any, channelNumber: number){
    switch (channelNumber) {
      case 0:
          this.oneMeter = meter;
        break;
    
      default:
        break;
    }
  }

  GetPeakMeter(channelNumber: number): any{
    switch (channelNumber) {
      case 0:
        return this.oneMeter;
      default:
        break;
    }
  }
}
