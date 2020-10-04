import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnInit, ElementRef, NgZone, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor, FilesystemDirectory } from '@capacitor/core';
import { Device } from '@ionic-native/device/ngx';
import { Cordova } from '@ionic-native/core';
import { Media } from '@ionic-native/media/ngx';
import { ModalController } from '@ionic/angular';
import { LoginResponse } from 'src/models/response/login-response.model';
import { SpotResponse } from 'src/models/response/spot-response.model';
import { UserAccountService } from 'src/services/account.service';
import { AuthenticationService } from 'src/services/authentication.service';
import { GlobalService } from 'src/services/global.service';
import { PadSpotCollectionService } from 'src/services/pad-spot-collection.service';
import { SessionIdentifiers } from 'src/utils/session-identifiers.enum';
import { StatusCode } from 'src/utils/status-code.enum';
import { LogoutModalComponent } from '../logout-modal/logout-modal.component';
import { FileSystemService } from 'src/services/file-system.service';
import { AudioService } from 'src/services/audio.service';
import { AudioEqTypes } from 'src/models/audio-eq-types.enum';
import { SpotRequest } from 'src/models/request/spot-request.model';
import { ThrowStmt } from '@angular/compiler';
import { CommercialPlayerService } from 'src/services/commercial-player.service';

@Component({
  selector: 'app-main-navigation',
  templateUrl: './main-navigation.page.html',
  styleUrls: ['./main-navigation.page.scss'],
  animations: [
    trigger('showMainLoading', [
      state('true', style(
        { 
          opacity: 1,
          "z-index": "*"
        })
      ),
      state('false', style(
        { 
          opacity: 0,
          "z-index": "-1"
        })
      ),
      transition('true => false', animate('1000ms')),
      transition('false => true', animate('1000ms'))
    ]),
  ]
})
export class MainNavigationPage implements OnInit, AfterViewInit {

  loadingInfoMessage: string = "";
  showMainLoading: boolean = false;
  userInfo: LoginResponse;
  superTabsConfig: any = {
    avoidElements: true,
    allowElementScroll: true,
    dragThreshold: 150
  };

  // create mixer context and gain node to be read into a bufffer.
  mixerContext: AudioContext;
  mixerWorker: AudioWorkletNode;

  //Pad Audio Element:
  padAudioElement: HTMLAudioElement;
  padSourceNode: MediaElementAudioSourceNode;
  currentPadFilePlaying: SpotResponse;
  padAudioContext: AudioContext;
  padGainNode: GainNode;
  padAnalyser: AnalyserNode;
  padBassEqNode: BiquadFilterNode;
  padMidEqNode: BiquadFilterNode;
  padTrebleEqNode: BiquadFilterNode;

  //Commercial Audio Element:
  commercialAudioElement: HTMLAudioElement;
  commercialSourceNode: MediaElementAudioSourceNode;
  currentCommercialPlaying: Array<SpotResponse>;
  commercialAudioContext: AudioContext;
  commercialGainNode: GainNode;
  commercialAnalyser: AnalyserNode;
  commercialBassEqNode: BiquadFilterNode;
  commercialMidEqNode: BiquadFilterNode;
  commercialTrebleEqNode: BiquadFilterNode;
  loadedCommercialBlock: Array<SpotResponse>;
  loadedCommercialBlockIndex: number = 0;

  constructor( private _padSpotService: PadSpotCollectionService,
               private _userAccountService: UserAccountService,
               private _modal: ModalController,
               private _authService: AuthenticationService,
               private _router: Router,
               private _ngZone: NgZone, 
               private _audioService: AudioService,
               private _commercialService: CommercialPlayerService ) { 
    this._userAccountService.userInfo$.subscribe(result =>{
      this.userInfo = result;
      });
      if(!this.userInfo){
        this.userInfo = this._userAccountService.GetSavedUserAccountInfo();
      }
  }

  ngOnInit() {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    this.mixerContext = new AudioContext();
    this.padAudioContext = new AudioContext();
    this.commercialAudioContext = new AudioContext();
  }

  ngAfterViewInit(){
    // build pad audio structor
    this.padAudioElement = document.getElementById('pad-audio') as HTMLAudioElement;
    this.padSourceNode = this.padAudioContext.createMediaElementSource(this.padAudioElement);
    this.padGainNode = this.padAudioContext.createGain();
    this.padBassEqNode = this._audioService.CreateAudioEq(this.padAudioContext, AudioEqTypes.Bass);
    this.padMidEqNode = this._audioService.CreateAudioEq(this.padAudioContext, AudioEqTypes.Mid);
    this.padTrebleEqNode = this._audioService.CreateAudioEq(this.padAudioContext, AudioEqTypes.Treble);
    this.padSourceNode.connect(this.padBassEqNode);
    this.padBassEqNode.connect(this.padTrebleEqNode);
    this.padTrebleEqNode.connect(this.padMidEqNode);
    this.padMidEqNode.connect(this.padGainNode);
    this.padGainNode.connect(this.padAudioContext.destination);
    this.padGainNode.gain.value = 0;
    if(this.padAudioContext.state == 'suspended'){
      this.padAudioContext.resume();
    }

    // TODO create listener for pad on mixer.
    this.commercialAudioElement = document.getElementById('commercial-audio') as HTMLAudioElement;
    this.commercialSourceNode = this.commercialAudioContext.createMediaElementSource(this.commercialAudioElement);
    this.commercialGainNode = this.commercialAudioContext.createGain();
    this.commercialBassEqNode = this._audioService.CreateAudioEq(this.commercialAudioContext, AudioEqTypes.Bass);
    this.commercialMidEqNode = this._audioService.CreateAudioEq(this.commercialAudioContext, AudioEqTypes.Mid);
    this.commercialTrebleEqNode = this._audioService.CreateAudioEq(this.commercialAudioContext, AudioEqTypes.Treble);
    this.commercialSourceNode.connect(this.commercialBassEqNode);
    this.commercialBassEqNode.connect(this.commercialTrebleEqNode);
    this.commercialTrebleEqNode.connect(this.commercialMidEqNode);
    this.commercialMidEqNode.connect(this.commercialGainNode);
    this.commercialGainNode.connect(this.commercialAudioContext.destination);
    this.commercialGainNode.gain.value = 0;
    if(this.commercialAudioContext.state == 'suspended'){
      this.commercialAudioContext.resume();
    }
    this._ngZone.runOutsideAngular(() => {
      this.commercialAudioElement.addEventListener('timeupdate', 
        this.SetCommercialTimeCallBack.bind(this)
      );
      this.commercialAudioContext.addEventListener('ended',
        this.SetCommercialPlayNextCallBack.bind(this)
      );
    });
    this._commercialService.SetAudioElement(this.commercialAudioElement);
  }

  public UpdateUserSpotList(userInfo: LoginResponse){
    let request = this._padSpotService.ConvertSpotFromResponseToRequest(userInfo.Spots);
    this._padSpotService.AddUpdateSpot(request).subscribe(response =>{
      if(response.StatusCode = StatusCode.Success) {
        this.userInfo.Spots = response.Data;
        this._userAccountService.SaveUserAccountInfo(this.userInfo);
      }
    });
  }

  PlayPadAudioFile(fileInfo: SpotResponse){
    if(this.currentPadFilePlaying != fileInfo){
      this.currentPadFilePlaying = fileInfo;
      this.padAudioElement.src = Capacitor.convertFileSrc(fileInfo.Uri);
      this.padAudioElement.currentTime = 0;
      this.padAudioElement.play();
    }
    else{
      if(!this.padAudioElement.paused){
        this.padAudioElement.pause();
      }
      else{
        this.padAudioElement.play();
      }
    }
  }

  async Logout(){
    const modal = await this._modal.create({
      component: LogoutModalComponent,
      cssClass: "logout-modal"
    });

    modal.onDidDismiss().then((_data: any) =>{
      if(_data['data'] != null){
        let result = _data['data'];
        if(result == true){
          this._authService.RequestLogout().subscribe((result: any) => {
            if(result.StatusCode == StatusCode.Success){
              localStorage.removeItem(SessionIdentifiers.Authorization);
              localStorage.removeItem(SessionIdentifiers.UserAccoutInfo);
              localStorage.removeItem(SessionIdentifiers.UserLoggedIn);
              this._ngZone.run(()=>{
                this._router.navigateByUrl('/home');
              });
            }
          });
        }
      }
      else{
        console.log("We didn't get data :(");
      }
    })
    return await modal.present(); 
  }

  SetCommercialPlayNextCallBack(){
    if(this.commercialAudioContext.state == 'suspended'){
      this.commercialAudioContext.resume();
    }
    this._commercialService.PlayNextTrack();
  }

  SetCommercialTimeCallBack(){
    this._commercialService.DisplayCurrentTimePlayed();
  }

  SetLoadedCommercial(spotList: Array<SpotResponse>){
    this.loadedCommercialBlock = spotList;
    this.loadedCommercialBlockIndex = 0;
  }
}
