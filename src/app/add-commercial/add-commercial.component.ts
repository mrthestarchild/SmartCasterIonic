import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { UserAccountService } from 'src/services/account.service';
import { ModalController } from '@ionic/angular';
import { LoginResponse } from 'src/models/response/login-response.model';
import { CdkDragDrop, moveItemInArray, copyArrayItem } from '@angular/cdk/drag-drop';
import { SpotCollectionResponse } from 'src/models/response/spot-collection-response.model';
import { UtilsService } from 'src/services/utils.service';
import { SpotResponse } from 'src/models/response/spot-response.model';
import { SpotCollectionSettings } from 'src/models/spot-collection-settings.model';
import { StatusCode } from 'src/utils/status-code.enum';
import { GlobalService } from 'src/services/global.service';
import { PadSpotCollectionService } from 'src/services/pad-spot-collection.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommercialPlayerService } from 'src/services/commercial-player.service';
import { MixerService } from 'src/services/mixer.service';

@Component({
  selector: 'app-add-commercial',
  templateUrl: './add-commercial.component.html',
  styleUrls: ['./add-commercial.component.scss'],
  animations: [
    trigger('addHandle', [
      state('true', style(
        { 
          margin: '0'
        })
      ),
      state('false', style(
        { 
          margin: '0 0 0 24px'
        })
      ),
      transition('true => false', animate('300ms')),
      transition('false => true', animate('300ms'))
    ]),
    trigger('handleOpacity', [
      state('true', style(
        { 
          opacity: '0'
        })
      ),
      state('false', style(
        { 
          opacity: '1'
        })
      ),
      transition('true => false', animate('300ms')),
      transition('false => true', animate('300ms'))
    ]),
  ]
})
export class AddCommercialComponent implements OnInit {

  userInfo: LoginResponse;

  selectedSpotCollection: SpotCollectionResponse = new SpotCollectionResponse();
  selectedSpotCollectionIndex: number = 0;

  hasNoCommercialsLoaded: boolean = false;
  saveSpotCollectionLoading: boolean = false;

  audioSessionActive: boolean;

  constructor(private _userAccountService: UserAccountService,
              private _ngZone: NgZone,
              private _utilsService: UtilsService,
              private _commercialService: CommercialPlayerService,
              private _changeDetector: ChangeDetectorRef,
              private _padSpotService: PadSpotCollectionService,
              private _mixerService: MixerService ) {
    this._userAccountService.userInfo$.subscribe(result =>{
      if(result){
        this.userInfo = result;
      }
    });
    if(!this.userInfo){
      this.userInfo = this._userAccountService.GetSavedUserAccountInfo();
    }
    this._commercialService.currentCommercialList$.subscribe(commercial =>{
      if(commercial){
        this.selectedSpotCollection = commercial;
      }
    });
    if(this.userInfo.SpotCollections == null || this.userInfo.SpotCollections.length == 0){
      this.hasNoCommercialsLoaded = true;
    }
    else{
      this.hasNoCommercialsLoaded = false;
      this.selectedSpotCollection = this._utilsService.DeepCopy<SpotCollectionResponse>(this.userInfo.SpotCollections[this.selectedSpotCollectionIndex]);
      this._commercialService.SetCommercial(this.selectedSpotCollection);
    }
    this._mixerService.audioSessionActive$.subscribe(value => {
      this.audioSessionActive = value;
    });
    if(!this.audioSessionActive) {
      this.audioSessionActive = this._mixerService.localAudioSessionActive;
    }
  }

  ngOnInit() {}

  /**
   * Handles drag and drop event.
   * @param event 
   */
  Drop(event: CdkDragDrop<SpotResponse[]>) {
    // reordering createCommercialList
    if (event.previousContainer.id == 'createCommercialList' && 
        event.isPointerOverContainer == true &&
        event.container.id != 'spotItemList') {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }
    // transfering from spot list to commercial list
    else if(event.previousContainer.id == 'spotItemList' && event.container.id == 'createCommercialList'){
      console.log("Trying to copy item");
      copyArrayItem(event.previousContainer.data,
                    event.container.data,
                    event.previousIndex,
                    event.currentIndex);
    }
    // removing item in createCommercial list
    else if ((event.previousContainer.id == 'createCommercialList' && event.isPointerOverContainer == false) ||
             (event.previousContainer.id == 'createCommercialList' && event.container.id == 'spotItemList')) {
      this.selectedSpotCollection.SpotList.splice(event.previousIndex, 1);
    }
    this._commercialService.SetCommercial(this.selectedSpotCollection);
  }

  /**
   * Selects a commercial to edit and sets the commercial inside of the commercial player-
   * @param commercialIndex 
   */
  SelectCommercialToEdit(commercialIndex: number){
    this._ngZone.run(() =>{
      this.selectedSpotCollectionIndex = commercialIndex;
      this.selectedSpotCollection = this._utilsService.DeepCopy<SpotCollectionResponse>(this.userInfo.SpotCollections[this.selectedSpotCollectionIndex]);
      this.hasNoCommercialsLoaded = false;
      if(this.audioSessionActive) {
        this._commercialService.SetCommercial(this.selectedSpotCollection);
      }
    }); 
  }

  /**
   * Creates a new empty commercial for a user to populate spots into. 
   */
  CreateNewCommercial(){
    let newCommercial = new SpotCollectionResponse();
    newCommercial.Id = -1;
    newCommercial.Name = "";
    newCommercial.Description = `Spot Collection for ${this.userInfo.UserInfo.CredLogin}`;
    newCommercial.Settings = new SpotCollectionSettings();
    newCommercial.SpotList = new Array<SpotResponse>();
    
    setTimeout(() =>{
      this._changeDetector.detectChanges();
    },200);
    this.selectedSpotCollection = newCommercial;
    this.hasNoCommercialsLoaded = false;
    this._commercialService.SetCommercial(this.selectedSpotCollection);
  }

  /**
   * Cancels creating a commercial and resets it to an empty commercial 
   */
  CancelCreateCommercial(){
    this.hasNoCommercialsLoaded = true;
    this.selectedSpotCollection = new SpotCollectionResponse();
    this.selectedSpotCollection.SpotList = new Array<SpotResponse>();
    this._commercialService.SetCommercial(this.selectedSpotCollection);
  }

  /**
   * Saves a commercial (spot list) for a given user.
   * @param item 
   */
  SaveCommercial(item: SpotCollectionResponse){
    this.saveSpotCollectionLoading = true;
    let currentCollection = this.userInfo.SpotCollections.find(x => x.Id == item.Id &&
                                                                    x.ShortCode == item.ShortCode);
    if(currentCollection == null){
      currentCollection = item;
      console.log("There was a problem finding the correct collection to update.");
    }
    currentCollection.Name = item.Name;
    currentCollection.Settings.SpotOrder = new Array<number>();
    currentCollection.SpotList.forEach(spot =>{
      currentCollection.Settings.SpotOrder.push(spot.Id);
    });
    let request = this._padSpotService.ConvertSpotCollectionFromResponseToRequest(currentCollection);

    this._padSpotService.AddUpdateSpotCollection(request).toPromise().then(response =>{
      if(response.StatusCode == StatusCode.SUCCESS){
        let spotCollection = this.userInfo.SpotCollections.find(collection => collection.Id == response.Data.Id);
        if(spotCollection == null || spotCollection == undefined){
          this.userInfo.SpotCollections.push(response.Data);
          this._userAccountService.SaveUserAccountInfo(this.userInfo);
        }
        else{
          this.userInfo.SpotCollections.forEach(collection =>{
            if(collection.Id == response.Data.Id){
              collection = response.Data;
            }
          });
          this._userAccountService.SaveUserAccountInfo(this.userInfo);
        }
        this.saveSpotCollectionLoading = false;
      }
      // TODO: write error handling.
    });
  }

//#region  Utility
  /**
   * Predicate to assist with drag and drop functionality
   * @returns 
   */
  NoReturnPredicate() {
    return false;
  }

  /**
   * Utility View Method to determine if the AudioPlayer should be hidden from the view
   * @returns 
   */
  ShouldHideAudioPlayer(): boolean {
    if(!this.audioSessionActive) {
      return true;
    } 
    if(this.hasNoCommercialsLoaded) {
      return true;
    }
    return false;
  }
//#endregion

}
