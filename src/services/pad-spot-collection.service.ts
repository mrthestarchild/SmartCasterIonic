import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { SpotRequest } from 'src/models/request/spot-request.model';
import { BaseResponse } from 'src/models/response/base-response.model';
import { SpotResponse } from 'src/models/response/spot-response.model';
import { PadCollectionRequest } from 'src/models/request/pad-collection-request.model';
import { PadCollectionResponse } from 'src/models/response/pad-collection-response.model';
import { SpotCollectionRequest } from 'src/models/request/spot-collection-request.model';
import { SpotCollectionResponse } from 'src/models/response/spot-collection-response.model';
import { SplitFileItems } from 'src/models/split-file-items.model';
import { Platform } from '@ionic/angular';
import * as moment from 'moment';


@Injectable({
  providedIn: 'root'
})
export class PadSpotCollectionService {

  baseUrl: string;

  constructor(private _http: HttpClient,
              private _platform: Platform) {
    this.baseUrl = environment.endpoint;
  }

  CreateNewSpotItem(fileInfo: SplitFileItems, duration: number): SpotResponse{
    let newSpot = new SpotResponse();
    newSpot.Uri = fileInfo.FileUri;
    newSpot.FileTypeId = fileInfo.FileTypeId;
    newSpot.Name = fileInfo.FileName;
    newSpot.Id = -1;
    // TODO: validate that we are getting a rounded number to display so .00 on the seconds
    newSpot.DurationMinutes = this.ConvertDuration(duration);
    return newSpot;
  }

  ConvertDuration(duration: number): number{
    if(this._platform.is('android')){
      let seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)));
      return parseFloat(`${minutes}.${seconds}`);
    }
    if(this._platform.is('ios')){
      return (Math.round(duration/60)/100);
    }
  }

  ConvertSpotCollectionFromResponseToRequest(collection: SpotCollectionResponse): SpotCollectionRequest{
    let spotCollection = new SpotCollectionRequest();
    spotCollection.Id = collection.Id;
    spotCollection.Name = collection.Name;
    spotCollection.Description = collection.Description;
    spotCollection.ShortCode = collection.ShortCode;
    spotCollection.Settings = collection.Settings;
    spotCollection.SpotList = this.ConvertSpotFromResponseToRequest(collection.SpotList);
    return spotCollection;
  }

  ConvertSpotFromResponseToRequest(spots: Array<SpotResponse>): Array<SpotRequest>{
    let request = new Array<SpotRequest>();
    spots.forEach(spot =>{
      let spotRequest = new SpotRequest();
      spotRequest.Id = spot.Id;
      spotRequest.Name = spot.Name;
      spotRequest.Description = spot.Description;
      spotRequest.FileTypeId = spot.FileTypeId;
      spotRequest.Uri = spot.Uri;
      spotRequest.DateUriValidated = moment(spot.DateUriValidated).toDate();
      spotRequest.IsGainOverride = spot.IsGainOverride;
      spotRequest.GainAuto = spot.GainAuto;
      spotRequest.DateGainAuto = moment(spot.DateGainAuto).toDate();
      spotRequest.GainManual = spot.GainManual;
      spotRequest.Setting = spot.Setting;
      spotRequest.DurationMinutes = spot.DurationMinutes;
      request.push(spotRequest);
    });
    return request;
  }

  ConvertPadCollectionResponseToRequest(padCollections: PadCollectionResponse): PadCollectionRequest{
    let padCollection = new PadCollectionRequest();
    padCollection.Id = padCollections.Id;
    padCollection.Name = padCollections.Name;
    padCollection.Description = padCollections.Description;
    padCollection.Settings = padCollections.Settings;
    padCollection.ShortCode = padCollections.ShortCode;
    padCollection.SpotList = this.ConvertSpotFromResponseToRequest(padCollections.SpotList);
    return padCollection;
  }

  AddUpdateSpot(request: Array<SpotRequest>){
    return this._http.post<BaseResponse<Array<SpotResponse>>>(`${this.baseUrl}/api/Spots/AddUpdateSpots`, request);
  }

  AddUpdatePadCollection(request: PadCollectionRequest){
    return this._http.post<BaseResponse<PadCollectionResponse>>(`${this.baseUrl}/api/PadCollection/AddUpdatePadCollection`, request);
  }

  AddUpdatePadCollectionPromise(request: PadCollectionRequest){
    return this._http.post<BaseResponse<PadCollectionResponse>>(`${this.baseUrl}/api/PadCollection/AddUpdatePadCollection`, request).toPromise();
  }

  AddUpdateSpotCollection(request: SpotCollectionRequest){
    return this._http.post<BaseResponse<SpotCollectionResponse>>(`${this.baseUrl}/api/SpotCollection/AddUpdateSpotCollection`, request);
  }

  AddUpdateSpotCollectionPromise(request: SpotCollectionRequest){
    return this._http.post<BaseResponse<SpotCollectionResponse>>(`${this.baseUrl}/api/SpotCollection/AddUpdateSpotCollection`, request).toPromise();
  }
}
