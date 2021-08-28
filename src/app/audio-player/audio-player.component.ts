import { Component, Input, NgZone, OnInit } from '@angular/core';
import { MixerTimeResponse, PlayerState } from '@skylabs_technology/capacitor-mixer';
import { SpotCollectionResponse } from 'src/models/response/spot-collection-response.model';
import { CommercialPlayerService } from 'src/services/commercial-player.service';
import { UtilsService } from 'src/services/utils.service';

/**
 * Audio player for playing commercials
 */
@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss'],
})
export class AudioPlayerComponent implements OnInit {

  @Input() showPlaylistLabel: boolean = true;

  selectedSpotCollection: SpotCollectionResponse;

  totalTimePlayed: MixerTimeResponse;
  currentTimePlayed: MixerTimeResponse;

  currentIndex: number = 0;
  spotCollectionLength: number = 0;

  localPlayerState: PlayerState = "stop";

  constructor(private _commercialService: CommercialPlayerService,
              public _utilsService: UtilsService,
              private _ngZone: NgZone ) { 
    this._commercialService.currentCommercialList$.subscribe(commercial => {
      if(commercial) {
        this._ngZone.run(async () => {
          this.selectedSpotCollection = commercial;
          this.spotCollectionLength = commercial.SpotList.length - 1;
          this.currentTimePlayed = {
            hours: 0,
            minutes: 0,
            seconds: 0,
            milliSeconds: 0
          };
        });
      }
    });
    if(!this.selectedSpotCollection) {
      this.selectedSpotCollection = this._commercialService.localCommercialList;
      this.spotCollectionLength = this.selectedSpotCollection.SpotList.length - 1;
    }
    this._commercialService.currentIndex$.subscribe(index =>{
      this.currentIndex = index;
    });
    if(!this.currentIndex){
      this.currentIndex = this._commercialService.localCurrentIndex;
    }
    this._commercialService.totalTimePlayed$.subscribe(totalTime => {
      this.totalTimePlayed = totalTime;
    });
    if(!this.totalTimePlayed) {
      this.totalTimePlayed = this._commercialService.localTotalTimePlayed;
    }
    this._commercialService.currentTimePlayed$.subscribe(currentTime => {
      this.currentTimePlayed = currentTime;
    });
    if(!this.currentTimePlayed){
      this.currentTimePlayed = this._commercialService.localCurrentTimePlayed;
    }
  }

  ngOnInit() {}

  /**
   * Plays or pauses the state of the player.
   * @param isPreviousOrNext 
   */
  async PlayPausePlayer(): Promise<void> {
    this.localPlayerState = await this._commercialService.PlayOrPause();
  }

  /**
   * Stops current track and plays next track in the spot list
   * @returns 
   */
  PlayNextTrack(): void {
    if(this.currentIndex == this.spotCollectionLength) return;
    this._commercialService.PlayNextTrack();
  }

  /**
   * Stops previous track and plays previous track in the spot list
   * @returns 
   */
  PlayPreviousTrack(): void {
    if(this.currentIndex == 0) return;
    this._commercialService.PlayPreviousTrack();
  }
}
