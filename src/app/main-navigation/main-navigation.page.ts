import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnInit, NgZone, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { ModalController } from '@ionic/angular';
import { LoginResponse } from 'src/models/response/login-response.model';
import { SpotResponse } from 'src/models/response/spot-response.model';
import { UserAccountService } from 'src/services/account.service';
import { AuthenticationService } from 'src/services/authentication.service';
import { PadSpotCollectionService } from 'src/services/pad-spot-collection.service';
import { SessionIdentifiers } from 'src/utils/session-identifiers.enum';
import { StatusCode } from 'src/utils/status-code.enum';
import { LogoutModalComponent } from '../logout-modal/logout-modal.component';
import { AudioService } from 'src/services/audio.service';
import { AudioEqTypes } from 'src/models/audio-eq-types.enum';
import { CommercialPlayerService } from 'src/services/commercial-player.service';
import { UtilsService } from 'src/services/utils.service';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';


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
  // streamDestination: MediaStreamAudioDestinationNode;

  // audioInput1
  // oneAudioBufferRawArray: Array<Float32Array> = new Array<Float32Array>();
  // oneAudioPreviousBufferArray: Array<number>;
  // oneAudioBufferCurrentIndex: number = 0;
  // oneAudioBuffer: AudioBuffer;
  // onePeakMeter: any;
  // oneAudioAnalyser: AnalyserNode;
  // oneAudioContext: AudioContext;
  // oneBufferSource: AudioBufferSourceNode;
  // // oneMediaStreamSource: MediaStreamAudioSourceNode;
  // oneGainNode: GainNode;
  // oneAnalyser: AnalyserNode;
  // oneBassEqNode: BiquadFilterNode;
  // oneMidEqNode: BiquadFilterNode;
  // oneTrebleEqNode: BiquadFilterNode;

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

  // Test stuffs.
  // testCount = 0;
  // totalReceivedData: number;
  // audioDataQueue: any;
  // concatenateMaxChunks:number = 20;
  // timerGetNextAudio: any; 
  // timerInterval: any;
  // fileReader: FileReader;
  // totalPlayedData: number;


  constructor( private _padSpotService: PadSpotCollectionService,
               private _userAccountService: UserAccountService,
               private _modal: ModalController,
               private _authService: AuthenticationService,
               private _router: Router,
               private _ngZone: NgZone, 
               private _audioService: AudioService,
               private _utilsService: UtilsService,
               private _backgroundMode: BackgroundMode,
               private _commercialService: CommercialPlayerService ) { 
    this._userAccountService.userInfo$.subscribe(result =>{
      this.userInfo = result;
      });
      if(!this.userInfo){
        this.userInfo = this._userAccountService.GetSavedUserAccountInfo();
      }
      // this.audioDataQueue = new Array<any>();
  }

  ngOnInit() {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    // this.mixerContext = new AudioContext();
    this.padAudioContext = new AudioContext();
    this.commercialAudioContext = new AudioContext();
    // this.oneAudioContext = new AudioContext();
    this._backgroundMode.enable();
  }

  ngAfterViewInit(){
    // one pad audio.
    // this.oneMediaStreamSource = this.oneAudioContext.createMediaStreamSource();
    // this.oneScriptProcessor = this.oneAudioContext.createScriptProcessor(16384, 1, 1);
    //this.oneAnalyser = this.oneAudioContext.createAnalyser();
    // this.oneAudioElement = document.getElementById('one-audio') as HTMLAudioElement;
    // this.oneGainNode = this.oneAudioContext.createGain();
    // this.oneBufferSource = this.oneAudioContext.createBufferSource();
    // this.oneBassEqNode = this._audioService.CreateAudioEq(this.oneAudioContext, AudioEqTypes.Bass);
    // this.oneMidEqNode = this._audioService.CreateAudioEq(this.oneAudioContext, AudioEqTypes.Mid);
    // this.oneTrebleEqNode = this._audioService.CreateAudioEq(this.oneAudioContext, AudioEqTypes.Treble);
    // this.oneBufferSource.connect(this.oneBassEqNode);
    // this.oneBassEqNode.connect(this.oneTrebleEqNode);
    // this.oneTrebleEqNode.connect(this.oneMidEqNode);
    // this.oneMidEqNode.connect(this.oneGainNode);
    // this.oneGainNode.connect(this.oneAudioContext.destination);
    // this.oneGainNode.gain.value = 0;

    // build pad audio structure
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
    // this.padGainNode.connect(this.streamDestination);
    this.padGainNode.gain.value = 0;
    if(this.padAudioContext.state == 'suspended'){
      this.padAudioContext.resume();
    }

    // this.padAudioContext.createScriptProcessor();

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
      // window.addEventListener( "audioinput", this.OnAudioInput.bind(this), false );
    });
    this._commercialService.SetAudioElement(this.commercialAudioElement);
    // audioinput.getMicrophonePermission( this.HasMircophonePermissions.bind(this) );
    // if(audioinput.isCapturing()){
    //   audioinput.stop();
    // }

  }
//#region Working Mic input
  // HasMircophonePermissions(value){
  //   console.log("Microphone Permissions: " +value)
  //   // uncomment this if getUserMedia doesn't work.
  //   if(value){
      
  //     this.StartCapture();
  //     //this.startCapture();
  //   }
  //   // let oneAudioElement = document.getElementById('one-audio') as HTMLAudioElement;
  //   // console.log(navigator);
  //   // navigator.mediaDevices.getUserMedia({audio: true}).then(stream =>{
  //   //   console.log(stream);
  //   //   oneAudioElement.srcObject = stream;
  //   // });
  // }

  // StartCapture() {
  //   console.log("Starting Capture");
  //   if(!audioinput.isCapturing()){
  //     audioinput.start({
  //       // streamToWebAudio: true,
  //       // audioContext: this.oneAudioContext,
  //       // format: audioinput.FORMAT.PCM_16BIT,
  //       // bufferSize: 8192,
  //       // bufferSize: 64, 
  //       sampleRate: this.oneAudioContext.sampleRate,
  //       format: audioinput.FORMAT.PCM_16BIT,
  //       channels: 1,
  //       concatenateMaxChunks: 80,
  //       // debug: true
  //     });
  //     //audioinput.stop();
  //   }
  // }

  // async OnAudioInput( evt ) {
  //   // 'evt.data' is an integer array containing raw audio data
  //   if(this.testCount == 0){
  //     // console.log("event data: " +evt.data);
  //     // console.log("event type:" + evt.type);
  //     // console.log("event typeof" + typeof evt);
  //     // console.log("event data typeof" + typeof evt.data);
  //     // let testBuffer = evt.data as ArrayBuffer;
  //     // console.log("event data as ArrayBuffer: " + testBuffer);
  //     // console.log("type of testBuffer" + typeof testBuffer);
  //     // console.log("instanceof testBuffer: " +(evt.data instanceof ArrayBuffer) )
  //     // console.log("array buffer: " + JSON.stringify(new ArrayBuffer(16)));
  //     // let stringData = Object.values(evt.data) as Array<number>;
  //     // console.log("stringData type of: " +typeof(stringData));
  //     // console.log("stringData: " +stringData);
  //     //console.log(evt.data);
  //   }
  //   // let stringData = evt.data as string;
    
  //   // let splitData = stringData.split(",");

  //   // what we have right now.
  //   let numberData = Object.values(evt.data) as Array<number>;
  //   let floatArray = await this.ConvertStringArrayToFloat32Array(numberData, this.oneAudioPreviousBufferArray);
  //   this.oneAudioPreviousBufferArray = this._utilsService.DeepCopy<Array<number>>(numberData);
  //   // console.log(JSON.stringify(floatArray));
  //   // if(this.testCount == 0){
  //     //console.log("type of floatArray: " +floatArray);
  //      this.ProcessSound(floatArray);
  //   // }
    
  //   //this.ProcessSound(floatArray);
  //   this.testCount++;
  // }

  // async ProcessSound( raw: Float32Array ) {
  //   //console.log("ProcessSound");
  //   if(this.oneAudioContext.state == 'suspended'){
  //     this.oneAudioContext.resume();
  //   }
  //   // console.log("arrayBuffer: " +JSON.stringify(arrayBuffer));
  //   // let testBlob = new Blob([raw], {type: "audio/wav"});
  //   // let arrayBuffer = await testBlob.arrayBuffer();
  //   // this is working-ish!

  //   // great proof of concept the issue is we are playing out of a mic that can hear the speaker so
  //   // this issue happens when there is feedback.
  //   this.oneAudioBufferRawArray.push(raw);
  //   if(this.oneAudioBufferCurrentIndex != 0){
  //     this.oneAudioBufferRawArray.shift();
  //   }
  //   this.oneBufferSource = this.oneAudioContext.createBufferSource();
  //   // if(this.onePeakMeter == undefined || this.onePeakMeter == null){
  //   //   this.onePeakMeter = this._meterService.GetPeakMeter(0);
  //   // }
  //   // if(this.onePeakMeter){
  //   //    this.oneBufferSource.connect(this.onePeakMeter);
  //   // }
  //   this.oneBufferSource.connect(this.oneBassEqNode);
  //   this.oneBassEqNode.connect(this.oneTrebleEqNode);
  //   this.oneTrebleEqNode.connect(this.oneMidEqNode);
  //   this.oneMidEqNode.connect(this.oneGainNode);
  //   if(this.onePeakMeter && this.onePeakMeter.hasOwnProperty("connect")){
  //     this.onePeakMeter.connect(this.oneGainNode);
  //   }
  //   this.oneGainNode.connect(this.oneAudioContext.destination);
  //   this.oneAudioBuffer = this.oneAudioContext.createBuffer( 1, raw.length, this.oneAudioContext.sampleRate );
  //   this.oneAudioBuffer.getChannelData(0).set(this.oneAudioBufferRawArray[0]);
  //   this.oneBufferSource.buffer = this.oneAudioBuffer;
  //   this.oneBufferSource.start(0);
  //   this.oneAudioBufferCurrentIndex++;
  // }

  // private ConvertStringArrayToFloat32Array(numArray: Array<number>, prevArray: Array<number> = null): Promise<Float32Array>{
  //   return new Promise((resolve, reject) =>{
  //     let floatArray = new Float32Array(numArray.length);
  //     for(let x = 0; x < numArray.length; x ++){
  //       //console.log("input: " +stringArray[x].toString());
  //       floatArray[x] = prevArray != null ? numArray[x] : numArray[x];
  //       //console.log("output" + floatArray[x]);
  //     }
  //     resolve(floatArray);
  //   })
  // }

  // DecodeError(err: DecodeErrorCallback){
  //   console.log(err);
  //   if(err){
  //     console.error("ERROR: " +err);
  //   }
  // }

//#endregion

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
    if(this.padAudioContext.state == 'suspended'){
      this.padAudioContext.resume();
    }
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
