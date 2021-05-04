import { Component, OnInit } from '@angular/core';
import { InAppBrowser, InAppBrowserOptions, InAppBrowserObject } from '@ionic-native/in-app-browser/ngx';
import { BrowserModule } from '@angular/platform-browser';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-web-browser',
  templateUrl: './web-browser.component.html',
  styleUrls: ['./web-browser.component.scss'],
})
export class WebBrowserComponent implements OnInit {

  url: string = "";
  canGoForward: boolean = false;
  canGoBackward: boolean = false;
  urlHistory: Array<string> = new Array<string>();
  urlIndex: number = 0;

  options : InAppBrowserOptions = {
    location : 'yes',//Or 'no' 
    hidden : 'no', //Or  'yes'
    clearcache : 'no',
    clearsessioncache : 'no',
    zoom : 'yes',//Android only ,shows browser zoom controls 
    hardwareback : 'yes',
    mediaPlaybackRequiresUserAction : 'no',
    shouldPauseOnSuspend : 'no', //Android only 
    closebuttoncaption : 'Close', //iOS only
    disallowoverscroll : 'no', //iOS only 
    toolbar : 'yes', //iOS only 
    enableViewportScale : 'yes', //iOS only 
    allowInlineMediaPlayback : 'no',//iOS only 
    presentationstyle : 'pagesheet',//iOS only 
    toolbarposition: "top",
    hideurlbar: "no",
    fullscreen : 'no',//Windows only  
  };

  constructor(private browser: InAppBrowser){}

  ngOnInit(){}

  public openWithSystemBrowser(url?: string){
    let target = "_system";
    url = "https://google.com";
    this.browser.create(url,target,this.options);
  }

  public openWithBlankBrowser(url : string){
    let target = "_blank";
    if(!url){
      url = "https://google.com";
    }
    this.browser.create(url,target,this.options);
  }

  public openWithIframe(url: string){
    url = this.url;
    if(!this.url.includes("https://")){
      this.url = "https://" + this.url;
    }
    if(this.urlIndex == (this.urlHistory.length - 1)){
      this.urlHistory.push(this.url);
    }
    else{
      this.urlHistory.splice(this.urlIndex + 1, 0, this.url)
    }
    if(this.urlHistory.length > 0){
      this.canGoBackward = true;
    }
    else{
      this.canGoBackward = false;
    }
    if(this.urlIndex == this.urlHistory.length - 1){
      this.canGoForward = false;
    }
    this.urlIndex++;
    this.browser.create(this.url, 'test_iframe');
  }

  public GoBack(){
    this.urlIndex--;
      if(this.urlIndex == 0){
        this.canGoBackward = false;
      }
      this.canGoForward = true;
      this.url = this.urlHistory[this.urlIndex];
    this.openWithIframe(this.urlHistory[this.urlIndex]);
  }

  public GoForward(){
    this.urlIndex++;
    if(this.urlIndex == this.urlHistory.length - 1){
      this.canGoForward = false;
    }
    this.canGoBackward = true;
    this.url = this.urlHistory[this.urlIndex];
    this.openWithIframe(this.urlHistory[this.urlIndex]);
  }

  async OpenWithCapacitor(){
    await Capacitor.Plugins.Browser.open({url: 'http://capacitorjs.com/'})
  }
}
