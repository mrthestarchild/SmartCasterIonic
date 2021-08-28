import * as Hammer from 'hammerjs';
import { HammerGestureConfig } from '@angular/platform-browser';
import { Injectable } from '@angular/core';

@Injectable()
export class HammerjsConfig  extends HammerGestureConfig{
    overrides =  <any> {
        pan: { direction: Hammer.DIRECTION_ALL, threshold: 1},
        press: { time: 500 },
        pinch: { enable: false },
        rotate: { enable: false }
    }
}
