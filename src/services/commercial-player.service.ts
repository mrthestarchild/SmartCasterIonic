import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Subject } from 'rxjs';
import { SpotCollectionResponse } from 'src/models/response/spot-collection-response.model';
import { SpotResponse } from 'src/models/response/spot-response.model';

@Injectable({
  providedIn: 'root'
})
export class CommercialPlayerService {

  private currentCommercialList = new Subject<SpotCollectionResponse>();
  currentCommercialList$ = this.currentCommercialList.asObservable();
  localCommercialList: SpotCollectionResponse;

  private currentCommercialListIndex = new Subject<number>();
  currentCommercialListIndex$ = this.currentCommercialListIndex.asObservable();
  localCommercialIndex: number;

  private currectCommercialTimePlayed = new Subject<number>();
  currectCommercialTimePlayed$ = this.currectCommercialTimePlayed.asObservable();
  localPreviousTimePlayed: number;

  private audioElement = new Subject<HTMLAudioElement>();
  audioElement$ = this.audioElement.asObservable();
  localAudioElement: HTMLAudioElement;

  constructor() {

  }

  SetAudioElement(audioElement: HTMLAudioElement){
    this.localAudioElement = audioElement;
    this.audioElement.next(audioElement);
    let file = Capacitor.convertFileSrc(this.localCommercialList.SpotList[this.localCommercialIndex].Uri);
    console.log("set audio element file src: " +file)
    this.localAudioElement.src = Capacitor.convertFileSrc(this.localCommercialList.SpotList[this.localCommercialIndex].Uri);
  }

  DisplayCurrentTimePlayed(){
      this.currectCommercialTimePlayed.next(this.localAudioElement.currentTime + this.localPreviousTimePlayed);
  }

  SetCommercial(commercial: SpotCollectionResponse){
    this.currentCommercialList.next(commercial);
    this.currentCommercialListIndex.next(0);
    this.currectCommercialTimePlayed.next(0);
    this.localPreviousTimePlayed = 0;
    this.localCommercialIndex = 0;
    this.localCommercialList = commercial;
  }

  PlayPauseCommercial(){
    if(!this.localAudioElement.paused){
      this.localAudioElement.pause();
    }
    else{
      this.localAudioElement.play();
    }
  }

  PlayPreviousTrack(){
    if(this.localCommercialIndex > 0){
      this.localCommercialIndex--;
      this.localPreviousTimePlayed = this.GetCalculatedTime(this.localCommercialIndex, this.localCommercialList.SpotList);
      this.localAudioElement.src = Capacitor.convertFileSrc(this.localCommercialList.SpotList[this.localCommercialIndex].Uri);
      this.currentCommercialListIndex.next(this.localCommercialIndex);
      this.localAudioElement.play();
    }
  }

  PlayNextTrack(){
    if(this.localCommercialIndex < this.localCommercialList.SpotList.length - 1){
      this.localCommercialIndex++;
      this.localPreviousTimePlayed = this.GetCalculatedTime(this.localCommercialIndex, this.localCommercialList.SpotList);
      this.localAudioElement.src = Capacitor.convertFileSrc(this.localCommercialList.SpotList[this.localCommercialIndex].Uri);
      this.currentCommercialListIndex.next(this.localCommercialIndex);
      this.localAudioElement.play();
    }
  }

  private GetCalculatedTime(currentIndex: number, spotList: Array<SpotResponse>): number{
    let time = 0;
    for(let x = 0; x < currentIndex; x++){
      time += spotList[x].DurationMinutes;
    }
    return time;
  }

}
