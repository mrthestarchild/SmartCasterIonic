// import { Injectable } from '@angular/core';
// import * as TsWorker from "nativescript-worker-loader!../../../SmartCasterApp/src/workers/typescript.worker";

// @Injectable({
//   providedIn: 'root'
// })
// export class WorkerService {

//   // jsWorker: null;
//   tsWorker: null;
//   constructor() {
//   }

//   ngOnDestroy() {
//       // if (this.jsWorker) {
//       //     (<any>this.jsWorker).terminate();
//       // }
//       if (this.tsWorker) {
//           (<any>this.tsWorker).terminate();
//       }
//   }

//   initTsWorker() {
//       if (this.tsWorker) {
//           return this.tsWorker;
//       }

//       // add if building with webpack
//       this.tsWorker = new (TsWorker as any)();

//       return this.tsWorker;
//   }

//   // initJsWorker() {
//   //     if (this.jsWorker) {
//   //         return this.jsWorker;
//   //     }

//   //     const JsWorker = require("nativescript-worker-loader!./workers/javascript.worker.js");
//   //     this.jsWorker = new JsWorker();

//   //     return this.jsWorker;
//   // }
// }
