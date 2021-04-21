import { Injectable } from '@angular/core';
import { AudioEqTypes as AudioEqTypes } from 'src/models/audio-eq-types.enum';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  constructor() {}

  CreateAudioEq(context: AudioContext ,type: AudioEqTypes): BiquadFilterNode{
    let node = context.createBiquadFilter();
    switch (type) {
        case AudioEqTypes.HighPass:
            node.type = "highpass";
            node.frequency.value = 80;
            node.gain.value = 0;
        case AudioEqTypes.Bass:
            node.type = "lowshelf";
            node.frequency.value = 90;
            node.gain.value = 0;
            return node;
        case AudioEqTypes.Mid:
            node.type = "peaking";
            node.frequency.value = 10000;
            node.gain.value = 0;
            return node;
        case AudioEqTypes.Treble:
            node.type = "highshelf";
            node.frequency.value = 10000;
            node.gain.value = 0;
            return node;
    }
  }

}
