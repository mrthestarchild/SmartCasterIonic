import { ChangeDetectorRef, Component, Host, NgZone, OnInit } from '@angular/core';
import { SpotCollectionResponse } from 'src/models/response/spot-collection-response.model';
import { CommercialPlayerService } from 'src/services/commercial-player.service';
@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss'],
})
export class AudioPlayerComponent implements OnInit {

  selectedSpotCollection: SpotCollectionResponse;
  currectTimePlayed: number;
  currentIndex: number = 0;
  localAudioElement: HTMLAudioElement;
  spotCollectionLength: number;

  constructor(private _commercialService: CommercialPlayerService,
              private _changeRef: ChangeDetectorRef,
              private _ngZone: NgZone ) { 
    this._commercialService.currentCommercialList$.subscribe(commercial =>{
      if(commercial){
        this._ngZone.run(() => {
          this.selectedSpotCollection = commercial;
          this.spotCollectionLength = commercial.SpotList.length - 1;
          // this._changeRef.detectChanges();
        });
      }
    });
    if(!this.selectedSpotCollection){
      this.selectedSpotCollection = this._commercialService.localCommercialList;
      this.spotCollectionLength = this.selectedSpotCollection.SpotList.length - 1;
    }
    this._commercialService.currectCommercialTimePlayed$.subscribe(time =>{
      if(time){
        this._ngZone.run(() => {
          this.currectTimePlayed = time;
          this._changeRef.detectChanges();
        });
      }
    });
    if(!this.currectTimePlayed){
      this.currectTimePlayed = this._commercialService.localPreviousTimePlayed;
    }
    this._commercialService.currentCommercialListIndex$.subscribe(index =>{
      if(index){
        this._ngZone.run(() => {
          this.currentIndex = index;
        });
      }
    });
    if(!this.currentIndex){
      this.currentIndex = this._commercialService.localCommercialIndex;
    }
    this._commercialService.audioElement$.subscribe(audio =>{
      if(audio){
        this._ngZone.run(() => {
          this.localAudioElement = audio;
        });
      }
    });
    if(!this.localAudioElement){
      this.GetAudioElement();
    }
  }

  ngOnInit() {}

  GetAudioElement(){
    let interval = setInterval(() =>{
      if(!this.localAudioElement){
        this.localAudioElement = this._commercialService.localAudioElement;
      }
      else{
        clearInterval(interval);
      }
    }, 500);
  }

  PlayPausePlayer(){
    this._commercialService.PlayPauseCommercial();
  }

  PlayNextTrack(){
    this.currentIndex++;
    this._commercialService.PlayNextTrack();
  }
  PlayPreviousTrack(){
    this.currentIndex--;
    this._commercialService.PlayPreviousTrack();
  }

  GetTotalSpotCollectionTime(): number{
    if(this.selectedSpotCollection == null || this.selectedSpotCollection == undefined) return 0;
    let totalTime = 0;
    this.selectedSpotCollection.SpotList.forEach(spot =>{
      totalTime += spot.DurationMinutes
    });
    return totalTime;
  }

}
