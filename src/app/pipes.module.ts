import { NgModule } from '@angular/core';
import { ConvertSecondsForViewPipe } from 'src/pipes/convert-seconds-for-view.pipe';
import { PadMinimumDigitsPipe } from 'src/pipes/pad-minimum-digits.pipe';

@NgModule({
declarations: [ConvertSecondsForViewPipe, PadMinimumDigitsPipe],
imports: [],
exports: [ConvertSecondsForViewPipe, PadMinimumDigitsPipe],
})

export class PipesModule {}