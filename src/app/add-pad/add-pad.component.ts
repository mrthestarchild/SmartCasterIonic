import { Component, OnInit, AfterViewInit, NgZone, Host } from '@angular/core';
import { UserAccountService } from 'src/services/account.service';
import { LoginResponse } from 'src/models/response/login-response.model';
import { SpotResponse } from 'src/models/response/spot-response.model';
import { ModalController, AlertController } from '@ionic/angular';
import { AddPadModalComponent } from '../add-pad-modal/add-pad-modal.component';
import { AddPad } from 'src/models/add-pad.model';
import { StatusCode } from 'src/utils/status-code.enum';
import { FileSystemService } from 'src/services/file-system.service';
import { ChooserResult } from '@ionic-native/chooser/ngx';
import { PadSpotCollectionService } from 'src/services/pad-spot-collection.service';
import { IOSFilePicker } from '@ionic-native/file-picker/ngx';
import { MainNavigationPage } from '../main-navigation/main-navigation.page';
import { AudioService } from 'src/services/audio.service';
import { UtilsService } from 'src/services/utils.service';
import { SpotSetting } from 'src/models/spot-setting.model';
import { BaseResponse } from 'src/models/response/base-response.model';
import { PadCollectionResponse } from 'src/models/response/pad-collection-response.model';
import * as moment from 'moment';
import { SessionIdentifiers } from 'src/utils/session-identifiers.enum';
import { Capacitor, FilesystemDirectory, FilesystemEncoding } from '@capacitor/core';

@Component({
  selector: 'app-add-pad',
  templateUrl: './add-pad.component.html',
  styleUrls: ['./add-pad.component.scss'],
})
export class AddPadComponent implements OnInit, AfterViewInit {

  _mainNav: MainNavigationPage;

  userInfo: LoginResponse;
  selectedPadCollectionIndex: number = 0;

  chooserData: ChooserResult;

  //TODO move this into mixer view so it only handled once.
  audioContext: AudioContext;
  currentFilePlaying: SpotResponse;
  audioElement: HTMLAudioElement;


  constructor(private _userAccountService: UserAccountService,
              private _modal: ModalController,
              private _fileService: FileSystemService,
              private _alertController: AlertController,
              private _ngZone: NgZone,
              private _spotService: PadSpotCollectionService,
              private _utilsService: UtilsService,
              private _audioService: AudioService,
              @Host() mainNav: MainNavigationPage ) {
    this._mainNav = mainNav;
    this._userAccountService.userInfo$.subscribe(result =>{
      this.userInfo = result;
    });
    if(!this.userInfo){
      this.userInfo = JSON.parse(localStorage.getItem(SessionIdentifiers.UserAccoutInfo));
    }
    if(this.userInfo.PadCollections == null || this.userInfo.PadCollections.length == 0){
      this.userInfo.PadCollections = new Array<PadCollectionResponse>();
      let padCollection = new PadCollectionResponse();
      padCollection.Id = -1;
      padCollection.Name = "Enter Pad Collection Name";
      padCollection.Description = `Pad Collection For ${this.userInfo.UserInfo.CredLogin}`;
      padCollection.DateCreate = moment().toDate();
      padCollection.SpotList = new Array<SpotResponse>();
      this.userInfo.PadCollections.push(padCollection);
      this._userAccountService.SaveUserAccountInfo(this.userInfo);
    }
  }
 
  ngOnInit() {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new AudioContext();
    
  }

  ngAfterViewInit(){
    this.audioElement = document.querySelector('audio');
    let track = this.audioContext.createMediaElementSource(this.audioElement);
    track.connect(this.audioContext.destination);
    if(this.audioContext.state == 'suspended'){
      this.audioContext.resume();
    }
  }

  /**
   * Plays Audio associated with Pad
   * @param fileInfo 
   */
  async PlayAudioFile(fileInfo: SpotResponse, index: number){
    if(this.currentFilePlaying != fileInfo){
      let mediaInfo = await this._audioService.ConvertFilePathToBlob(fileInfo.Uri);
      this.currentFilePlaying = fileInfo;
      this.audioElement.src = mediaInfo.AudioObjectUrl;
      this.audioElement.currentTime = 0;
      this.audioElement.play();
    }
    else{
      if(!this.audioElement.paused){
        this.audioElement.pause();
      }
      else{
        this.audioElement.play();
      }
    }
  }

  public async OpenAddModal(){
    const modal = await this._modal.create({
      component: AddPadModalComponent,
      componentProps: {
        "spots": this.userInfo.Spots
      }
    });

    modal.onDidDismiss().then((_data: any) =>{
      if(_data['data'] != null){
        let addPadData = _data['data'] as AddPad;
        let newPad = this._utilsService.DeepCopy(this.userInfo.Spots[addPadData.SelectedIndex]);
        newPad.Setting = new SpotSetting();
        newPad.Setting.PadCollectionBackgroundColor = addPadData.SelectedBackgroundColor;
        newPad.Name = addPadData.Name == "" ? this.userInfo.Spots[addPadData.SelectedIndex].Name : addPadData.Name;
        this.userInfo.Spots[addPadData.SelectedIndex].Setting = newPad.Setting;
        this.userInfo.PadCollections[this.selectedPadCollectionIndex].SpotList.push(newPad);
        let request = this._spotService.ConvertPadCollectionResponseToRequest(this.userInfo.PadCollections[this.selectedPadCollectionIndex]);
        this._spotService.AddUpdatePadCollectionPromise(request).then((response: BaseResponse<PadCollectionResponse>) =>{
          if(response.StatusCode == StatusCode.Success){
            let padCollection = this.userInfo.PadCollections.find(collection => collection.Id == response.Data.Id);
            if(padCollection == null || padCollection == undefined){
              this.userInfo.PadCollections.push(response.Data);
              this._userAccountService.SaveUserAccountInfo(this.userInfo);
            }
            else{
              this.userInfo.PadCollections.forEach(collection =>{
                if(collection.Id == response.Data.Id){
                  collection = response.Data;
                }
              });
              this._userAccountService.SaveUserAccountInfo(this.userInfo);
            }
          }
        });
      }
      else{
        console.log("We didn't get data :(");
      }
    })
    return await modal.present();
  }

  async SelectFile(){
    let result = await this._fileService.GetFileFromSystem();
    if(result.StatusCode == StatusCode.Success){
      this.chooserData = result.Data as ChooserResult;
      let filePath = "";
      if(this.chooserData.uri){
        let fileNameWithExt = this.chooserData.name
        let readFile = await Capacitor.Plugins.Filesystem.readFile({
            path: this.chooserData.uri
        });
        let writenFile = await Capacitor.Plugins.Filesystem.writeFile({
          data: readFile.data,
          path: fileNameWithExt,
          directory: FilesystemDirectory.Data
        });
        let newUri = await Capacitor.Plugins.Filesystem.getUri({
          directory: FilesystemDirectory.Data,
          path: fileNameWithExt
        });
        filePath = newUri.uri;
        this.chooserData.uri = filePath;
      }
      this.chooserData.data
      let foundSpot: SpotResponse = this.userInfo.Spots.find(spot => spot.Uri == filePath);
      if(foundSpot == null || foundSpot == undefined){
        let fileInfo = this._fileService.SplitUriIntoItems(this.chooserData);
        let fileDuration = await this._fileService.GetTrackDuration(this.chooserData.uri);
        let newSpot = new SpotResponse();
        newSpot.Uri = fileInfo.FileUri;
        newSpot.FileTypeId = fileInfo.FileTypeId;
        newSpot.Name = fileInfo.FileName;
        newSpot.Id = -1;
        newSpot.DurationMinutes = this._spotService.ConvertDuration(fileDuration);
        this._ngZone.run(() =>{
          this.userInfo.Spots.push(newSpot);
        });
        this._mainNav.UpdateUserSpotList(this.userInfo);
      }
    }
    else{
      const alertError = await this._alertController.create({
        header: 'Error',
        message: `There was an error getting this file, please try again later. ${result.Data}`,
        buttons: [
          {
            text: 'Okay',
            handler: () => {
              console.warn("Error getting file from file system");
            }
          }
        ]
      });
      await alertError.present();
    }
  }
}
