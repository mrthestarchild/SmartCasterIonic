import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { ToastController, Platform, AlertController } from '@ionic/angular';
import { BluetoothLE, ScanParams, BluetoothScanMode, BluetoothMatchMode, BluetoothCallbackType, BluetoothMatchNum, ScanStatus, DeviceInfo } from '@ionic-native/bluetooth-le/ngx';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { Chooser, ChooserResult } from '@ionic-native/chooser/ngx';
import { FileSystemService } from 'src/services/file-system.service';
import { StatusCode } from 'src/utils/status-code.enum';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
})
export class TestComponent implements OnInit {

  devices: Array<ScanStatus> = [];
  serialDevices: any = [];
  statusMessage: string;
  bleScanOptions: ScanParams;
  bleScanMode: BluetoothScanMode;
  bleMatchMode: BluetoothMatchMode;
  bleMatchNumber: BluetoothMatchNum;
  bleCallbackType: BluetoothCallbackType;
  showScanning: boolean = false;

  uri: ChooserResult = {
    name: "nothing",
    uri: "nothing",
    dataURI: "nothing",
    mediaType: "nothing"
  };

  unpairedDevices: any;
  pairedDevices: any;
  gettingDevices: boolean;

  testList1 = [1,2,3,4,5,6,7];
  testList2 = [8,9,10,11,12];

  constructor(private ble: BluetoothLE,
              private platform: Platform,
              private _toastCtrl: ToastController,
              private bls: BluetoothSerial,
              private alertController: AlertController,
              private _ngZone: NgZone,
              private _fileService: FileSystemService) {
    this.platform.ready().then((readySource) => {
      console.log('Platform ready from', readySource);
      this.ble.initialize().subscribe(ble => {
        console.log('ble', ble.status) // logs 'enabled'
      });
    });
  }

  ngOnInit() {
    this.ble.isEnabled().then(success =>{
    }, err =>{
      alert("Error");
    });
    // if(this.ble.isScanning()){
    //   this.StopScan();
    // }
    this.bleScanMode = BluetoothScanMode.SCAN_MODE_LOW_POWER;
    this.bleMatchMode = BluetoothMatchMode.MATCH_MODE_AGRESSIVE;
    this.bleCallbackType = BluetoothCallbackType.CALLBACK_TYPE_FIRST_MATCH;
    this.bleMatchNumber = BluetoothMatchNum.MATCH_NUM_MAX_ADVERTISEMENT;
    this.bleScanOptions = {
      services: [],
      allowDuplicates: false,
      /** Defaults to Low Power. Available from API21 / API 23 (Android) */
      scanMode: this.bleScanMode,
      /** Defaults to Aggressive. Available from API23 (Android) */
      matchMode: this.bleMatchMode,
      /** Defaults to One Advertisement. Available from API23 (Android) */
      matchNum: this.bleMatchNumber,
      /** Defaults to All Matches. Available from API21 / API 23. (Android) */
      callbackType: this.bleCallbackType,
      /** True/false to show only connectable devices, rather than all devices ever seen, defaults to false (Windows) */
      isConnectable: true
    }
  }

  /**
   * Bluetooth Low energy methods
   */
  StartScan(){
    console.log("Started Scanning");
    this.devices = [];
    setTimeout(() =>{
      this.StopScan();
    }, 2000);
    this.showScanning = true;
    this.ble.startScan(this.bleScanOptions).subscribe((device: ScanStatus) =>{
      this._ngZone.run(()=>{
        console.log(device);
        this.devices.push(device);
      });
    });
  }

  StopScan(){
    this.showScanning = false;
    this.ble.stopScan();
  }

  GetConnectedDevices(){
    this.ble.retrieveConnected({
      "services": [
        "180D",
        "180f",
        "180a",
        "111E",
        "1108",
        "110A",
        "1109",
        "110B",
        "110C",
        "110F",
        "1112",
        "111F",
        "1132",
        "113A",
        "113B",
        "0311",
        "0200",
        "0201",
        "0202",
        "0203",
        "0204",
        "0205",
        "0301",
        "0302",
        "2a00",
        "11db",
        "2a00",
        "2a01",
        "2a02",
        "2a03",
        "2a04",
        "1800",
        "1801",
        "fe78"
      ]
    }).then(device =>{
      console.log(JSON.stringify(device));
    })
  }

  /**
   * Bluetooth Serial
   */
  ListPairedDevices(){
    this.bls.list().then((success: any) =>{
      this._ngZone.run(()=>{
        console.log("Success: " +success);
        this.serialDevices = success;
      }, error => {
        console.log("Error: " +error);
      });
    });
  }

  startScanning() {
    this.pairedDevices = null;
    this.unpairedDevices = null;
    this.gettingDevices = true;
    const unPair = [];
    this.bls.discoverUnpaired().then((success) => {
      success.forEach((value, key) => {
        var exists = false;
        unPair.forEach((val2, i) => {
          if (value.id === val2.id) {
            exists = true;
          }
        });
        if (exists === false && value.id !== '') {
          unPair.push(value);
        }
      });
      this.unpairedDevices = unPair;
      this.gettingDevices = false;
    },
      (err) => {
        console.log(err);
      });
  
    this.bls.list().then((success) => {
      this.pairedDevices = success;
    },
      (err) => {
  
      });
    }
  
  success = (data) => {
    this.deviceConnected();
  }
  fail = (error) => {
    alert(error);
  }
  
  async selectDevice(id: any) {
  
    const alert = await this.alertController.create({
      header: 'Connect',
      message: 'Do you want to connect with?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Connect',
          handler: () => {
            this.bls.connect(id).subscribe(this.success, this.fail);
          }
        }
      ]
    });
    await alert.present();
  }
  
  deviceConnected() {
    this.bls.isConnected().then(success => {
      alert('Connected Successfullly');
    }, error => {
      alert('error' + JSON.stringify(error));
    });
  }
  
  async disconnect() {
    const alert = await this.alertController.create({
      header: 'Disconnect?',
      message: 'Do you want to Disconnect?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Disconnect',
          handler: () => {
            this.bls.disconnect();
          }
        }
      ]
    });
    await alert.present();
  }

  async SelectFile(){
    let result = await this._fileService.GetFileFromSystem();
    if(result.StatusCode == StatusCode.Success){
      this.uri = result.Data;
    }
    else{
      const alertError = await this.alertController.create({
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

  Drop(event: CdkDragDrop<string[]>) {
    console.dir(event);
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
    }
  }
  
}
