import { Component, ElementRef, ViewChild, NgZone } from '@angular/core';
import { Animation, AnimationController } from '@ionic/angular';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { setClassMetadata } from '@angular/core/src/r3_symbols';
import { Router } from '@angular/router';
import { SessionIdentifiers } from 'src/utils/session-identifiers.enum';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  animations: [
    trigger('showLoginAnimation', [
      state('true', style({ 
        opacity: 1,
        transform: "*",
        height: "*",
        margin: "*"
      })),
      state('false', style(
        { 
          opacity: 0,
          transform: "scale(0)",
          height: 0,
          margin: 0
        }
        )),
      transition('true => false', animate('400ms')),
      transition('false => true', animate('400ms'))
    ]),
    trigger('colorRotate', [
      state('true', style({ 
        opacity: 1,
        transform: "*",
        height: "*"
      })),
      state('false', style(
        { 
          opacity: 0,
          transform: "scale(0)",
          height: 0
        }
        )),
      transition('true => false', animate('500ms')),
      transition('false => true', animate('500ms'))
    ])
  ]
})
export class HomePage {

  @ViewChild('logo',{ read: ElementRef, static: true }) logo: ElementRef;
  showLogin: boolean = true;
  changeColor: boolean = true;
  hideLogo: Animation;

  constructor(private _animationController: AnimationController,
              private _router: Router,
              private _ngZone: NgZone) {
      // TODO: remove after testing?
      let userLoggedIn = JSON.parse(localStorage.getItem(SessionIdentifiers.UserLoggedIn));
      console.log("userLoggedIn: " + userLoggedIn);
      if(userLoggedIn === true){
        this._router.navigateByUrl("/main-navigation");
      }
  }

  OpenCreateAccount() {
    this.showLogin = false;
  }

  CloseCreateAccount() {
    this._ngZone.run(() =>{
      this.showLogin = true;
    });
  }

}
