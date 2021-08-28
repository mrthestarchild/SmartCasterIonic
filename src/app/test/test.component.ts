import { Component, OnInit, NgZone } from '@angular/core';
import { Platform, AlertController } from '@ionic/angular';
import { FileSystemService } from 'src/services/file-system.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';


@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
})
export class TestComponent implements OnInit {

  scannedBle: Array<any>;
  // bleOptions: BLEScanOptions;

  deviceInfoFound: boolean = false;
  isInitialized: boolean = false;

  serialDevices: any = [];
  statusMessage: string;
  showScanning: boolean = false;

  // uri: ChooserResult = {
  //   name: "nothing",
  //   uri: "nothing",
  //   dataURI: "nothing",
  //   mediaType: "nothing"
  // };

  unpairedDevices: any;
  pairedDevices: any;
  gettingDevices: boolean;

  testList1 = [1,2,3,4,5,6,7];
  testList2 = [8,9,10,11,12];

  constructor(
              private platform: Platform,
              private alertController: AlertController,
              private _ngZone: NgZone,
              private _fileService: FileSystemService) {
    this.platform.ready().then((readySource) => {
    });
  }

  ngOnInit() {

  }

  /**
   * Bluetooth Low energy methods
   */
  StartScan(){
    console.log("Started Scanning");
    
  }

  StopScan(){
    this.showScanning = false;
  }

  GetConnectedDevices(){
    
  }

  /**
   * Bluetooth Serial
   */
  ListPairedDevices(){
    
  }

  startScanning() {
    
  }
  
  async selectDevice(id: any) {
  }
  
  deviceConnected() {
    
  }
  
  async disconnect() {
    
  }

  async SelectFile(){
    
  }

  Drop(event: CdkDragDrop<string[]>) {
    
  }

  DiscoverDevices(){
    
  }
  
}
