import { SpotResponse } from './response/spot-response.model';

export class WebAudioChannel {
    audioContext!: AudioContext;
    currentFilePlaying!: SpotResponse;
    audioElement!: HTMLAudioElement;
    gainNode!: GainNode;
}
