import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
import { Platform } from '@ionic/angular';

@Pipe({
  name: 'convertSecondsForView'
})
export class ConvertSecondsForViewPipe implements PipeTransform {

  constructor(private _platform: Platform) {}

  transform(value: number): any {
    if(this._platform.is("ios")){
      let time = moment('01/01/1900', 'MM/DD/YYYY').seconds(value).format('mm:ss');
      return  `${time}`
    }
    // TODO: add view for android
  }

}
