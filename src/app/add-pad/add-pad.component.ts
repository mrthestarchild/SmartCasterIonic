import { Component, OnInit, AfterViewInit, NgZone, Host } from '@angular/core';
import { UserAccountService } from 'src/services/account.service';
import { LoginResponse } from 'src/models/response/login-response.model';
import { SpotResponse } from 'src/models/response/spot-response.model';
import { ModalController, AlertController } from '@ionic/angular';
import { AddPadModalComponent } from '../add-pad-modal/add-pad-modal.component';
import { AddPad } from 'src/models/add-pad.model';
import { StatusCode } from 'src/utils/status-code.enum';
import { FileSystemService } from 'src/services/file-system.service';
import { PadSpotCollectionService } from 'src/services/pad-spot-collection.service';
import { MainNavigationPage } from '../main-navigation/main-navigation.page';
import { UtilsService } from 'src/services/utils.service';
import { SpotSetting } from 'src/models/spot-setting.model';
import { BaseResponse } from 'src/models/response/base-response.model';
import { PadCollectionResponse } from 'src/models/response/pad-collection-response.model';
import * as moment from 'moment';
import { BaseMixerRequest, Mixer, ResponseStatus } from '@skylabs_technology/capacitor-mixer';
import { MixerService } from 'src/services/mixer.service';
import { PadPlayerService } from 'src/services/pad-player.service';

@Component({
  selector: 'app-add-pad',
  templateUrl: './add-pad.component.html',
  styleUrls: ['./add-pad.component.scss'],
})
export class AddPadComponent implements OnInit, AfterViewInit {

  _mainNav: MainNavigationPage;

  userInfo: LoginResponse;
  selectedPadCollectionIndex: number = 0;

  chooserData: string;

  currentPad: SpotResponse;

  audioSessionActive: boolean;

  constructor(private _userAccountService: UserAccountService,
              private _modal: ModalController,
              private _fileService: FileSystemService,
              private _alertController: AlertController,
              private _ngZone: NgZone,
              private _spotService: PadSpotCollectionService,
              private _padPlayerService: PadPlayerService,
              private _mixerService: MixerService,
              private _utilsService: UtilsService,
              @Host() mainNav: MainNavigationPage ) {
    this._mainNav = mainNav;
    this._userAccountService.userInfo$.subscribe(result =>{
      if(result){
        this.userInfo = result;
      }
    });
    if(!this.userInfo){
      this.userInfo = this._userAccountService.GetSavedUserAccountInfo();
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
      console.error("Pad Collection Check on add-pad, We should never hit this again");
    }
    this._mixerService.audioSessionActive$.subscribe(value => {
      this.audioSessionActive = value;
    });
    if(!this.audioSessionActive) {
      this.audioSessionActive = this._mixerService.localAudioSessionActive;
    }
  }
 
  ngOnInit() {}

  ngAfterViewInit(){}

  /**
   * Plays Audio associated with Pad from main component
   * @param fileInfo 
   */
  async PlayAudioFile(fileInfo: SpotResponse){
    this._padPlayerService.PlayPausePlayer(fileInfo);
  }
  
  /**
   * Opens the file system modal and adds the new file to the pad system
   * 
   * @returns 
   */
  public async OpenAddModal(){
    const modal = await this._modal.create({
      component: AddPadModalComponent,
      componentProps: {
        spots: this.userInfo.Spots
      }
    });

    // Handles modal data return
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
        this._spotService.AddUpdatePadCollection(request).toPromise().then((response: BaseResponse<PadCollectionResponse>) =>{
          if(response.StatusCode == StatusCode.SUCCESS){
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

  /**
   * Selects a file from a file system.
   * 
   * Saves the new file to user spots.
   * 
   * Adds File to Mixer queue.
   */
  async SelectFile(){
    let result = await this._fileService.GetFileFromSystem();
    if(result.StatusCode == StatusCode.SUCCESS){
      this.chooserData = result.Data;
      let filePath = "";
      if(!this.chooserData) {
        // TODO: write error handling.
      }
      let foundSpot: SpotResponse = this.userInfo.Spots.find(spot => spot.Uri == filePath);
      if(foundSpot == null || foundSpot == undefined) {
        let fileInfo = this._fileService.SplitUriIntoItems(this.chooserData);

        let newSpot = new SpotResponse();
        newSpot.Uri = fileInfo.FileUri;
        newSpot.FileTypeId = fileInfo.FileTypeId;
        newSpot.Name = fileInfo.FileName;
        newSpot.Id = -1;

        let response = await this._mixerService.CreateAudioInput(newSpot);
        if(response.status == ResponseStatus.SUCCESS){
          // TODO: look at what to do with listeners
        }
        else {
          // TODO: do error handling
        }

        let totalTimeRequest: BaseMixerRequest = {
          audioId: response.data.value
        }
        let totalTimeResponse = await Mixer.getTotalTime(totalTimeRequest);

        let fileDuration = this._utilsService.ConvertMixerTimeToSeconds(totalTimeResponse.data);

        newSpot.DurationMinutes = fileDuration;
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
