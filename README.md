# SmartCaster Ionic

## Initial Pull
To initialize the application you will first need to ensure your developement environment follows this environment

This is the current working environment for this application
```
    _                      _                 ____ _     ___
    / \   _ __   __ _ _   _| | __ _ _ __     / ___| |   |_ _|
   / △ \ | '_ \ / _` | | | | |/ _` | '__|   | |   | |    | |
  / ___ \| | | | (_| | |_| | | (_| | |      | |___| |___ | |
 /_/   \_\_| |_|\__, |\__,_|_|\__,_|_|       \____|_____|___|
                |___/
    

Angular CLI: 11.2.9
Node: 10.22.0
OS: darwin x64

Angular: 11.2.11
... animations, common, compiler, compiler-cli, core, forms
... language-service, platform-browser, platform-browser-dynamic
... router
Ivy Workspace: Yes

Package                         Version
---------------------------------------------------------
@angular-devkit/architect       0.1102.9
@angular-devkit/build-angular   0.1102.9
@angular-devkit/core            10.0.8
@angular-devkit/schematics      10.0.8
@angular/cdk                    11.2.10
@angular/cli                    11.2.9
@angular/material               11.2.10
@schematics/angular             10.0.8
@schematics/update              0.1102.9
rxjs                            6.5.5
typescript                      4.1.5

Ionic:

   Ionic CLI                     : 6.12.0 (/usr/local/lib/node_modules/@ionic/cli)
   Ionic Framework               : @ionic/angular 5.3.2
   @angular-devkit/build-angular : 0.1102.9
   @angular-devkit/schematics    : 10.0.8
   @angular/cli                  : 11.2.9
   @ionic/angular-toolkit        : 2.3.3

Capacitor:

   Capacitor CLI   : 2.4.0
   @capacitor/core : 2.4.0

Utility:

   cordova-res (update available: 0.15.3) : 0.15.1
   native-run (update available: 1.3.0)   : 1.0.0

System:

   NodeJS : v10.22.0 (/usr/local/bin/node)
   npm    : 6.14.6
   OS     : macOS Big Sur
```

## Building Your Environment
Great, now you have set up your environment. We will need to set up a few more things before we can load the application.

### Build NPM
```
npm i
```
This will build your NPM environment and enable the project to build

### Build Ionic
```
ionic build
```
This will set up your environment and create a www folder that will be used to build capacitor

### Build Capacitor
```
ionic cap add ios
ionic cap add android
```
This will build your local working environment so that you initialize your application through xcode or android studio.

### Run Capacitor 
```
ionic cap run ios -l --external
ionic cap run android -l --external
```
This will open xCode or Android Studio and prepare your application to run in the environment.

### Syncing Capacitor with Ionic 

```
ionic cap copy
```
Every time you perform a build (e.g. ionic build) that changes your web directory (default: www), you’ll need to copy those changes down to your native projects:
