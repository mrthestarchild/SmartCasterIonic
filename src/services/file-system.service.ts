import { Injectable, NgZone } from '@angular/core';
import { FileTypeListResponse } from 'src/models/file-type-list-response.model';
import { SpotResponse } from 'src/models/response/spot-response.model';
import { SplitFileItems } from 'src/models/split-file-items.model';
import { LocalServiceResponse } from 'src/models/response/local-service-response.model';
import { StatusCode } from 'src/utils/status-code.enum';
import { HttpClient } from '@angular/common/http';
import { SessionIdentifiers } from 'src/utils/session-identifiers.enum';
import { Directory, Filesystem } from '@capacitor/filesystem';

import { IOSFilePicker } from '@ionic-native/file-picker/ngx';
import { FileChooser, FileChooserOptions } from '@ionic-native/file-chooser/ngx';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class FileSystemService {

  fileServiceAudioContext: AudioContext;
  
  
  constructor(private _iosFilePicker: IOSFilePicker, 
              private _androidFilePicker: FileChooser,
              private _platform: Platform) {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    this.fileServiceAudioContext = new AudioContext();
  }

  async LoadAudioFile(fileInfo: SpotResponse): Promise<AudioBuffer>{
    let response = await fetch(fileInfo.Uri);
    let arrayBuffer = await response.arrayBuffer();
    let audioBuffer = await this.fileServiceAudioContext.decodeAudioData(arrayBuffer);
    return audioBuffer;
  }

  /**
   * Opens Device file picker to get audio file information
   */
  async GetFileFromSystem(): Promise<LocalServiceResponse<string>>{
    let response = new LocalServiceResponse<any>();
    if(this._platform.is('ios')){
      return await this._iosFilePicker.pickFile("audio/*").then((file: string) =>{
        response.StatusCode = StatusCode.SUCCESS;
        response.Data = file;
        return response;
      }).catch((error: any)=>{
        response.StatusCode = StatusCode.ERROR;
        response.Data = error;
        return response;
      });
    }
    else if(this._platform.is('android')){
      let options: FileChooserOptions = {
        mime: "audio/*"
      }
      return await this._androidFilePicker.open(options).then((file: string) =>{
        response.StatusCode = StatusCode.SUCCESS;
        response.Data = file;
        return response;
      }).catch((error: any)=>{
        response.StatusCode = StatusCode.ERROR;
        response.Data = error;
        return response;
      });
    }
    else {
      response.StatusCode = StatusCode.ERROR;
      response.Data = "Unsupported platform";
      return response;
    }
  }

  
  /**
   * Splits the file path in to a SplitFileItems object and returns the values.
   * 
   * @returns 
   */
  public SplitUriIntoItems(fileInfo: string): SplitFileItems {
    // splits the string to get the name and type from the file path
    let fileItems = fileInfo.split(".");
    let fileName = fileItems[fileItems.length - 2].trim();
    let fileType = fileItems[fileItems.length - 1].trim();

    let fileTypeId = null;
    let audioFileTypes = JSON.parse(localStorage.getItem(SessionIdentifiers.AudioFileTypes)) as FileTypeListResponse;
    if(audioFileTypes){
      if(audioFileTypes.FileTypesList) {
        let foundFileType = audioFileTypes.FileTypesList.find(type => type.Name.includes(fileType));
        if(foundFileType){
          fileTypeId = foundFileType.Id;
        }
      }
    }
    let response = new SplitFileItems();
    response.FileName = fileName;
    response.FileType = fileType;
    response.FileTypeId = fileTypeId ? fileTypeId : 1;
    response.FileUri = fileInfo;
    return response;
  }

  ValidateSpotListUri(spots: Array<SpotResponse>): Promise<Array<SpotResponse>> {
    return new Promise(async (resolve, reject) => {
        for(let x = 0; x < spots.length; x++){
          await Filesystem.stat({
            path: spots[x].Uri
          }).then(file => { 
            spots[x].CanResolveUri = true;
          }).catch(async error => {
            spots[x] = await this.UpdateSpotUriWithFoundLocation(spots[x]);
          });
        }
        resolve(spots);
    });
    
  }

  async UpdateSpotUriWithFoundLocation(spot: SpotResponse): Promise<SpotResponse>{
      let testName = spot.Uri.substring(spot.Uri.lastIndexOf("/") + 1);
      return await Filesystem.stat({
        directory: Directory.Documents,
        path: testName
      }).then(file => { 
        spot.Uri = file.uri;
        spot.CanResolveUri = true;
        return spot;
      }).catch(error => {
        spot.CanResolveUri = false;
        return spot;
      });
  }

}
