import { Injectable } from '@angular/core';
import { MixerTimeEvent, MixerTimeResponse } from '@skylabs_technology/capacitor-mixer';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  // public commercialExtension: string = "_commercial";
  // public padExtension: string = "_pad";
  public meterListenerExtension: string = "_meter";
  public elapsedTimeListenerExtension: string = "_ellapsedTime";

  constructor() { }

  /**
   * Returns a number to a minium padded digits
   * @param value 
   * @param minimumDigits 
   * @returns 
   */
  PadNumberToMinimumDigits(value: number, minimumDigits: number){
    return value.toLocaleString('en-US', {
      minimumIntegerDigits: minimumDigits,
      useGrouping: false
    })
  }

  /**
   * Converts a MixerTimeResponse or a MixerTimeEvent into total duration in seconds.
   * @param value 
   * @returns 
   */
  ConvertMixerTimeToSeconds(value: MixerTimeResponse | MixerTimeEvent): number {
    if(!value) return;
    let total = 0;
    total += value.hours * 3600
    total += value.minutes * 60
    total += value.seconds
    total += value.milliSeconds / 1000
    return total;
  }

  /**
   * Does a copy of an object and copies every portion of the object.
   * @param obj 
   * @returns 
   */
  DeepCopy<T>(obj: T): T {
    let copy;
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = this.DeepCopy(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = this.DeepCopy(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
  }
}
