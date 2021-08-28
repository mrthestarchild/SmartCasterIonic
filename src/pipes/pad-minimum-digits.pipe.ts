import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'padMinimumDigits'
})
export class PadMinimumDigitsPipe implements PipeTransform {

  transform(value: number, minimumDigits: number): string {
    return value.toLocaleString('en-US', {
      minimumIntegerDigits: minimumDigits,
      useGrouping: false
    }) 
  }

}
