import { Injectable, NgZone, ViewContainerRef } from '@angular/core';
import { FileTypeListResponse } from 'src/models/file-type-list-response.model';
import { SpotResponse } from 'src/models/response/spot-response.model';
import { SplitFileItems } from 'src/models/split-file-items.model';
import { ChooserResult, Chooser } from '@ionic-native/chooser/ngx';
import { LocalServiceResponse } from 'src/models/response/local-service-response.model';
import { StatusCode } from 'src/utils/status-code.enum';
import { HttpClient } from '@angular/common/http';
import { Capacitor, FilesystemDirectory } from '@capacitor/core';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { SessionIdentifiers } from 'src/utils/session-identifiers.enum';

@Injectable({
  providedIn: 'root'
})
export class FileSystemService {

  fileServiceAudioContext: AudioContext;
  
  
  constructor(private filePicker: Chooser,
              private _http: HttpClient,
              private _ngZone: NgZone,
              private _media: Media) {
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
  async GetFileFromSystem(): Promise<LocalServiceResponse<any>>{
    let response = new LocalServiceResponse<any>();
    return await this.filePicker.getFile("audio/*").then((file: ChooserResult) =>{
        response.StatusCode = StatusCode.Success;
        response.Data = file;
        return response;
      }).catch((error: any)=>{
        response.StatusCode = StatusCode.Error;
        response.Data = error;
        return response;
      });
  }

  

  public SplitUriIntoItems(fileInfo: ChooserResult): SplitFileItems {
    let fileItems = fileInfo.name.split(".");
    let fileName = fileItems[0];
    let fileType = fileItems[1];
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
    response.FileUri = fileInfo.uri;
    return response;
  }

  GetTrackDuration(trackUri: string): Promise<number>{
    return new Promise((resolve, reject) =>{
      let path = trackUri.replace(/^file:\/\//, "");
      let audioFile = this._media.create(path);
      audioFile.setVolume(1);
      audioFile.play(); 
      let duration = -1;
      let interval = setInterval(() => {
        if(duration == -1) {
          duration = audioFile.getDuration();
        } else {
          audioFile.release();
          clearInterval(interval);
          resolve(duration);
        }
      }, 10);
    });
  }

  ValidateSpotListUri(spots: Array<SpotResponse>): Promise<Array<SpotResponse>>{
    return new Promise(async (resolve, reject) =>{
        for(let x = 0; x < spots.length; x++){
          await Capacitor.Plugins.Filesystem.stat({
            path: spots[x].Uri
          }).then(file =>{ 
            spots[x].CanResolveUri = true;
          }).catch(async error =>{
            spots[x] = await this.UpdateSpotUriWithFoundLocation(spots[x]);
          });
        }
        resolve(spots);
    });
    
  }

  async UpdateSpotUriWithFoundLocation(spot: SpotResponse): Promise<SpotResponse>{
      let testName = spot.Uri.substring(spot.Uri.lastIndexOf("/") + 1);
      return await Capacitor.Plugins.Filesystem.stat({
                        directory: FilesystemDirectory.Documents,
                        path: testName
                      }).then(file =>{ 
                        spot.Uri = file.uri;
                        spot.CanResolveUri = true;
                        return spot;
                      }).catch(error =>{
                        spot.CanResolveUri = false;
                        return spot;
                      });
  }

}
