import { Component, OnInit, NgZone } from '@angular/core';
import { UserAccountService } from 'src/services/account.service';
import { ModalController } from '@ionic/angular';
import { LoginResponse } from 'src/models/response/login-response.model';
import { CdkDragDrop, moveItemInArray, transferArrayItem, copyArrayItem} from '@angular/cdk/drag-drop';
import { SpotCollectionResponse } from 'src/models/response/spot-collection-response.model';
import { UtilsService } from 'src/services/utils.service';
import { SpotResponse } from 'src/models/response/spot-response.model';
import { SessionIdentifiers } from 'src/utils/session-identifiers.enum';
import { SpotCollectionSettings } from 'src/models/spot-collection-settings.model';

@Component({
  selector: 'app-add-commercial',
  templateUrl: './add-commercial.component.html',
  styleUrls: ['./add-commercial.component.scss'],
})
export class AddCommercialComponent implements OnInit {

  userInfo: LoginResponse;
  selectedSpotCollection: SpotCollectionResponse = new SpotCollectionResponse();
  selectedSpotCollectionIndex: number = 0;
  hasNoCommercialsLoaded: boolean = false;

  constructor(private _userAccountService: UserAccountService,
              private _modal: ModalController,
              private _ngZone: NgZone,
              private _utilsService: UtilsService) {
    this._userAccountService.userInfo$.subscribe(result =>{
    this.userInfo = result;
    });
    if(!this.userInfo){
      this.userInfo = JSON.parse(localStorage.getItem(SessionIdentifiers.UserAccoutInfo));
    }
    if(this.userInfo.SpotCollections == null || this.userInfo.SpotCollections.length == 0){
      this.hasNoCommercialsLoaded = true;
    }
    else{
      this.selectedSpotCollection = this._utilsService.DeepCopy<SpotCollectionResponse>(this.userInfo.SpotCollections[this.selectedSpotCollectionIndex]);
    }
  }

  ngOnInit() {
    
  }

  Drop(event: CdkDragDrop<SpotResponse[]>) {
    console.dir(event);
    // reordering createCommercialList
    if (event.previousContainer.id == 'createCommercialList' && 
        event.isPointerOverContainer == true &&
        event.container.id != 'spotItemList') {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    }
    // transfering from spot list to commercial list
    else if(event.previousContainer.id == 'spotItemList' && event.container.id == 'createCommercialList'){
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
  }

  SelectCommercialToEdit(commercialIndex: number){
    this._ngZone.run(() =>{
      this.selectedSpotCollectionIndex = commercialIndex;
      this.selectedSpotCollection = this.userInfo.SpotCollections[this.selectedSpotCollectionIndex];
    }); 
  }

  CreateNewCommercial(){
    let newCommercial = new SpotCollectionResponse();
    newCommercial.Id = -1;
    newCommercial.Name = "";
    newCommercial.Description = `Spot Collection for ${this.userInfo.UserInfo.CredLogin}`;
    newCommercial.Settings = new SpotCollectionSettings();
    newCommercial.SpotList = new Array<SpotResponse>();
    this._ngZone.run(() => {
      this.selectedSpotCollection = newCommercial;
      this.hasNoCommercialsLoaded = false;
    });
  }

  CancelCreateCommercial(){
    this._ngZone.run(() => {
      this.selectedSpotCollection = new SpotCollectionResponse();
      this.hasNoCommercialsLoaded = true;
    });
  }

  NoReturnPredicate() {
    return false;
  }

}
