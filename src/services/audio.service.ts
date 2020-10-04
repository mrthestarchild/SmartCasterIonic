import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file/ngx';
import { Media } from '@ionic-native/media/ngx'; 
import { AudioEqTypes as AudioEqTypes } from 'src/models/audio-eq-types.enum';
import { Subject } from 'rxjs';
import { SpotResponse } from 'src/models/response/spot-response.model';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  constructor(private _file: File,
              private _media: Media) {
               }

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
